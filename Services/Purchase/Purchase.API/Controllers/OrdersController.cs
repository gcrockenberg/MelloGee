namespace Me.Services.Purchase.API.Controllers;

using Stripe;
using Stripe.Checkout;
using OrderItem = Data.DTOs.OrderItem;

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

    public OrdersController(
        IMediator mediator, IIdentityService identityService, IOrderQueries orderQueries,
        ILogger<OrdersController> logger, IEventBus eventBus, ICartService cartService, ICartRepository cartRepository)
    {
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        _orderQueries = orderQueries ?? throw new ArgumentNullException(nameof(orderQueries));
        _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

        // See Program.cs why this is duplicated
        _cartService = cartService ?? throw new ArgumentNullException(nameof(cartService));
        _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
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
    public async Task<ActionResult<OrderDTO>> GetOrderAsync(int orderId)
    {
        try
        {
            //Todo: It's good idea to take advantage of GetOrderByIdQuery and handle by GetCustomerByIdQueryHandler
            //var order customer = await _mediator.Send(new GetOrderByIdQuery(orderId));
            var order = await _orderQueries.GetOrderAsync(orderId);

            return order;
        }
        catch
        {
            return NotFound();
        }
    }


    /// <summary>
    /// Rereive Order with payment resources
    /// </summary>
    /// <param name="orderCheckout">Stripe mode will default to "intent</param>
    /// <returns></returns>
    [Route("pay")]
    [HttpPost]
    [ProducesResponseType(typeof(PayOrderDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PayOrderDTO>> PayOrderAsync([FromBody] OrderCheckout orderCheckout)
    {
        try
        {
            //Todo: It's good idea to take advantage of GetOrderByIdQuery and handle by GetCustomerByIdQueryHandler
            //var order customer = await _mediator.Send(new GetOrderByIdQuery(orderId));
            var order = await _orderQueries.GetOrderAsync(orderCheckout.OrderId);
            if (null == order)
            {
                return NotFound();
            }

            CheckoutResponse paymentResources;
            if (orderCheckout.Mode.Equals(CheckoutMode.Redirect, StringComparison.OrdinalIgnoreCase))
            {
                List<SessionLineItemOptions> lineItemOptions = GetSessionLineItemOptions(order.orderItems);
                paymentResources = CreateStripeSession(lineItemOptions, orderCheckout.SuccessRoute, orderCheckout.CancelRoute);
            }
            else
            {
                long orderAmount = CalculateOrderAmount(order.orderItems);
                paymentResources = CreateStripeIntent(orderAmount);
            }


            return new PayOrderDTO
            {
                Order = order,
                Payment = paymentResources
            };
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
    /// Stripe checkout by redirect.
    /// gRPC should pull Cart from Cart service to insure validity of Cart instead of Cart pushed from Client
    /// </summary>
    /// <param name="cartCheckout">Required fields</param>
    /// <param name="requestId">Exception tracking</param>
    /// <returns>Redirect url to complete the checkout process</returns>
    [RequiredScope("cart.write")]
    [Route("checkout")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CheckoutResponse>> CheckoutAsync([FromBody] CartCheckout cartCheckout, [FromHeader(Name = "x-requestid")] string requestId)
    {
        cartCheckout.RequestId = (Guid.TryParse(requestId, out Guid guid) && guid != Guid.Empty) ?
            guid : cartCheckout.RequestId;


        // Making direct call until Microsoft releases update allowing multiple ports for ACA containers
        // TODO return to using gRPC to get Cart
        //var cart = await _cartService.GetBySessionIdAsync(compositeId); //_repository.GetCartAsync(compositeId);
        var cart = await _cartRepository.GetCartAsync(cartCheckout.CartSessionId);
        if (cart == null)
        {
            return BadRequest();
        }

        // Initialize command
        var createOrderCommand = new CreateOrderCommand(cart.Items, _identityService.GetUserIdentity(), _identityService.GetUserName(),
            cartCheckout.City, cartCheckout.Street, cartCheckout.State, cartCheckout.Country, cartCheckout.ZipCode, cartCheckout.CardNumber,
            cartCheckout.CardHolderName, cartCheckout.CardExpiration, cartCheckout.CardSecurityNumber, cartCheckout.CardTypeId, cart.SessionId);

        // Wrap the command for Mediator
        var requestCreateOrder = new IdentifiedCommand<CreateOrderCommand, Order>(createOrderCommand, cartCheckout.RequestId);

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

        CheckoutResponse response;
        if (cartCheckout.Mode.Equals(CheckoutMode.Redirect, StringComparison.OrdinalIgnoreCase))
        {
            List<SessionLineItemOptions> lineItemOptions = GetSessionLineItemOptions(cart.Items);
            response = CreateStripeSession(lineItemOptions, cartCheckout.SuccessRoute, cartCheckout.CancelRoute);
        }
        else
        {
            long orderAmount = CalculateOrderAmount(cart.Items);
            response = CreateStripeIntent(orderAmount);
        }

        response.OrderId = order.Id;

        return Accepted(response);
    }


    private CheckoutResponse CreateStripeIntent(long orderAmount)
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
        });

        return new CheckoutResponse { ClientSecret = paymentIntent.ClientSecret };
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


    private long CalculateOrderAmount(IEnumerable<OrderItem> items)
    {
        long result = 0;

        foreach (var item in items)
        {
            result += (long)(item.unitPrice * item.units * 100);
        }

        return result;
    }

    /// <summary>
    /// Initialize Stripe session which will return the url for redirect based checkout.
    /// </summary>
    /// <param name="cartCheckout"></param>
    /// <param name="cart"></param>
    /// <returns></returns>
    private CheckoutResponse CreateStripeSession(List<SessionLineItemOptions> lineItemOptions, string successRoute, string cancelRoute)
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

        return new CheckoutResponse { Url = session.Url };
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


    List<SessionLineItemOptions> GetSessionLineItemOptions(List<OrderItem> orderItems)
    {
        List<SessionLineItemOptions> lineItemOptions = new();

        foreach (var item in orderItems)
        {
            lineItemOptions.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)(item.unitPrice * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = item.productName
                    }
                },
                Quantity = item.units
            });
        }

        return lineItemOptions;
    }


}