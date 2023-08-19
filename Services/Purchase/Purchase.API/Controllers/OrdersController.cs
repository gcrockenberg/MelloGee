namespace Me.Services.Purchase.API.Controllers;

using Stripe;
using Stripe.Checkout;

[Route("api/v1/[controller]")]
[Authorize]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly IMediator _mediator;
    private readonly IOrderQueries _orderQueries;
    private readonly ILogger<OrdersController> _logger;
    private readonly IEventBus _eventBus;
    private readonly ICartService _cartService;
    private readonly ICartRepository _cartRepository;
    private readonly IOrderRepository _orderRepository;

    public OrdersController(
        IMediator mediator, IIdentityService identityService, IOrderQueries orderQueries,
        ILogger<OrdersController> logger, IEventBus eventBus, ICartService cartService, ICartRepository cartRepository,
        IOrderRepository orderRepository)
    {
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        _orderQueries = orderQueries ?? throw new ArgumentNullException(nameof(orderQueries));
        _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

        // See Program.cs why this is duplicated
        _cartService = cartService ?? throw new ArgumentNullException(nameof(cartService));
        _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
    }


    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OrderSummary>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<OrderSummary>>> GetOrdersAsync()
    {
        var userid = _identityService.GetUserIdentity();
        var orders = await _orderQueries.GetOrdersFromUserAsync(Guid.Parse(userid));

        return Ok(orders.ToList());
    }


    [Route("{orderId:int}")]
    [HttpGet]
    [ProducesResponseType(typeof(Order), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> GetOrderAsync(int orderId)
    {
        try
        {
            //Todo: It's good idea to take advantage of GetOrderByIdQuery and handle by GetCustomerByIdQueryHandler
            //var order customer = await _mediator.Send(new GetOrderByIdQuery(orderId));
            //var response = await _orderQueries.GetOrderAsync(orderId);
            var order = await _orderRepository.GetAsync(orderId, false, true, true, true);

            return new OrderResponse(order);
        }
        catch
        {
            return NotFound();
        }
    }


    /// <summary>
    /// Rereive Order with payment resources
    /// </summary>
    /// <param name="request">Stripe mode will default to "intent"</param>
    /// <returns>The order and Stripe payment resources</returns>
    [Route("pay")]
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> PayOrderAsync([FromBody] OrderCheckoutRequest request)
    {
        try
        {
            //Todo: It's good idea to take advantage of GetOrderByIdQuery and handle by GetCustomerByIdQueryHandler
            //var order customer = await _mediator.Send(new GetOrderByIdQuery(orderId));
            //var order = await _orderQueries.GetOrderAsync(request.OrderId);            
            var order = await _orderRepository.GetAsync(request.OrderId, false, true, true, true);
            if (null == order)
            {
                return NotFound();
            }

            // If CheckoutData data has already been generated then return the Order
            // TODO: Investigate Stipe data expiration and when to generate new CheckoutData
            if (!string.IsNullOrEmpty(order.StripeMode) && order.StripeMode.Equals(request.Mode, StringComparison.OrdinalIgnoreCase))
            {
                return new OrderResponse(order);
            }

            // Create and store Stripe checkout data
            CheckoutData checkoutData;
            if (request.Mode.Equals(CheckoutMode.Redirect, StringComparison.OrdinalIgnoreCase))
            {
                List<SessionLineItemOptions> lineItemOptions = GetSessionLineItemOptions(order.OrderItems);
                checkoutData = CreateStripeSession(lineItemOptions, request.SuccessRoute, request.CancelRoute);
            }
            else
            {
                long orderAmount = (long) order.GetTotal() * 100;
                checkoutData = CreateStripeIntent(order.Id.ToString(), orderAmount);
            }
            checkoutData.StripeMode = request.Mode;

            order.SetCheckoutData(checkoutData);
            await _orderRepository.UnitOfWork.SaveEntitiesAsync();  // Ensures any Domain Events get fired

            return new OrderResponse(order);
        }
        catch
        {
            return NotFound();
        }
    }


    [Route("draft")]
    [HttpPost]
    public async Task<ActionResult<OrderDraftDTO>> CreateOrderDraftFromCartDataAsync([FromBody] CreateOrderDraftCommand createOrderDraftCommand)
    {
        _logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            createOrderDraftCommand.GetGenericTypeName(),
            nameof(createOrderDraftCommand.BuyerId),
            createOrderDraftCommand.BuyerId,
            createOrderDraftCommand);

        return await _mediator.Send(createOrderDraftCommand);
    }


    /// <summary>
    /// Transition Cart to Order
    /// </summary>
    /// <param name="request">Required fields</param>
    /// <param name="requestId">Exception tracking</param>
    /// <returns>The new Order number</returns>
    [RequiredScope("cart.write")]
    [Route("checkout")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CartCheckoutAsync([FromBody] CartCheckoutRequest request, [FromHeader(Name = "x-requestid")] string requestId)
    {
        request.RequestId = (Guid.TryParse(requestId, out Guid guid) && guid != Guid.Empty) ?
            guid : request.RequestId;


        // Making direct call until Microsoft releases update allowing multiple ports for ACA containers
        // TODO return to using gRPC to get Cart
        //var cart = await _cartService.GetBySessionIdAsync(compositeId); //_repository.GetCartAsync(compositeId);
        var cart = await _cartRepository.GetCartAsync(request.CartSessionId);
        if (cart == null)
        {
            return NotFound();
        }

        // Initialize command
        var createOrderCommand = new CreateOrderCommand(cart.Items, _identityService.GetUserIdentity(), _identityService.GetUserName(),
            request.City, request.Street, request.State, request.Country, request.ZipCode, request.CardNumber,
            request.CardHolderName, request.CardExpiration, request.CardSecurityNumber, request.CardTypeId, cart.SessionId);

        // Wrap the command for Mediator
        var requestCreateOrder = new IdentifiedCommand<CreateOrderCommand, Order>(createOrderCommand, request.RequestId);

        _logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            requestCreateOrder.GetGenericTypeName(),
            nameof(requestCreateOrder.Id),
            requestCreateOrder.Id,
            requestCreateOrder);

        // If creation is successful, will emit OrderCreated integration event for Cart, SignalR, etc
        var order = await _mediator.Send(requestCreateOrder);
        if (null == order)
        {
            _logger.LogInformation("--> Error creating Order: _mediator.Send(requestCreateOrder);");
            return BadRequest();
        }

        return Accepted(new { OrderId = order.Id });
    }


    private CheckoutData CreateStripeIntent(string orderId, long orderAmount)
    {
        var paymentIntentService = new PaymentIntentService();
        var paymentIntent = paymentIntentService.Create(new PaymentIntentCreateOptions
        {
            Amount = orderAmount,
            Currency = "usd",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
            Metadata = new Dictionary<string, string> { { ORDER_NUMBER_TAG, orderId } }
        });

        return new CheckoutData { ClientSecret = paymentIntent.ClientSecret };
    }


    private long CalculateOrderAmount(IEnumerable<CartItem> items)
    {
        long result = 0;

        foreach (var item in items)
        {
            result += (long)(item.UnitPrice * item.Quantity * 100);
        }

        return result;
    }


    /// <summary>
    /// Initialize Stripe session which will return the url for redirect based checkout.
    /// </summary>
    /// <param name="cartCheckout"></param>
    /// <param name="cart"></param>
    /// <returns></returns>
    private CheckoutData CreateStripeSession(List<SessionLineItemOptions> lineItemOptions, string successRoute, string cancelRoute)
    {
        var domain = Request.Headers.Origin;    // e.g. http://localhost:4200

        var options = new SessionCreateOptions
        {
            SuccessUrl = domain + successRoute,
            CancelUrl = domain + cancelRoute,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItemOptions,
            Mode = "payment",
        };

        var service = new SessionService();
        Session session = service.Create(options);

        return new CheckoutData { Url = session.Url };
    }

    List<SessionLineItemOptions> GetSessionLineItemOptions(List<CartItem> cartItems)
    {
        List<SessionLineItemOptions> lineItemOptions = new();

        foreach (var item in cartItems)
        {
            lineItemOptions.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)(item.UnitPrice * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = item.ProductName
                    }
                },
                Quantity = item.Quantity
            });
        }

        return lineItemOptions;
    }


    List<SessionLineItemOptions> GetSessionLineItemOptions(IEnumerable<OrderItem> orderItems)
    {
        List<SessionLineItemOptions> lineItemOptions = new();

        foreach (var item in orderItems)
        {
            lineItemOptions.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)(item.GetUnitPrice() * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = item.GetOrderItemProductName()
                    }
                },
                Quantity = item.GetUnits()
            });
        }

        return lineItemOptions;
    }


}