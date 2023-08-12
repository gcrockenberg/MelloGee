namespace Me.Services.Purchase.API.Controllers;

using Stripe.Checkout;
using Order = Data.DTOs.Order;

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
    public async Task<ActionResult<Order>> GetOrderAsync(int orderId)
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
    /// Should only receive SessionId as parameter. Simply a Get request that is either accepted or rejected.
    /// gRPC should pull Cart from Cart service to insure validity of Cart instead of Cart pushed from Client
    /// </summary>
    /// <param name="cartCheckout"></param>
    /// <param name="requestId"></param>
    /// <returns></returns>
    [RequiredScope("cart.write")]
    [Route("checkout")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KeyValuePair<string, string>>> CheckoutAsync([FromBody] CartCheckout cartCheckout, [FromHeader(Name = "x-requestid")] string requestId)
    {
        cartCheckout.RequestId = (Guid.TryParse(requestId, out Guid guid) && guid != Guid.Empty) ?
            guid : cartCheckout.RequestId;


        // Making direct call until Microsoft releases update allowing multiple ports/transports for ACA containers
        // Use gRPC to get Cart
        //var cart = await _cartService.GetBySessionIdAsync(compositeId); //_repository.GetCartAsync(compositeId);
        var cart = await _cartRepository.GetCartAsync(cartCheckout.CartSessionId);
        if (cart == null)
        {
            _logger.LogInformation("--> Error retrieving Cart for cartId: {cartId}", cartCheckout.CartSessionId);
            foreach (var key in _cartRepository.GetCartIds())
            {
                _logger.LogInformation("--> Existing Redis key: {key}", key);
            }
            return BadRequest();
        }

        // Create the order via Mediator which, if Order creation is successful, will emit OrderCreated IntegrationEvent so Cart can clear itself
        var createOrderCommand = new CreateOrderCommand(cart.Items, _identityService.GetUserIdentity(), _identityService.GetUserName(),
            cartCheckout.City, cartCheckout.Street, cartCheckout.State, cartCheckout.Country, cartCheckout.ZipCode, cartCheckout.CardNumber,
            cartCheckout.CardHolderName, cartCheckout.CardExpiration, cartCheckout.CardSecurityNumber, cartCheckout.CardTypeId, cart.SessionId);

        var requestCreateOrder = new IdentifiedCommand<CreateOrderCommand, bool>(createOrderCommand, cartCheckout.RequestId);

        _logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            requestCreateOrder.GetGenericTypeName(),
            nameof(requestCreateOrder.Id),
            requestCreateOrder.Id,
            requestCreateOrder);

        var orderSuccessfullyCreated = await _mediator.Send(requestCreateOrder);
        if (!orderSuccessfullyCreated)
        {
            _logger.LogInformation("--> Error creating Order: _mediator.Send(requestCreateOrder);");
            return BadRequest();
        }

        var session = _CreateStripeSession(cartCheckout, cart);
        KeyValuePair<string, string> kvp = new("url", session.Url);
        // TEPORARY FORCE ROUTE TO SUCCESS
        //KeyValuePair<string, string> kvp = new("url", session.SuccessUrl);

        return Accepted(kvp);
    }


    private Session _CreateStripeSession(CartCheckout cartCheckout, CustomerCart cart)
    {
        var domain = Request.Headers.Origin;    // e.g. http://localhost:4200
        List<SessionLineItemOptions> lineItemOptions = new();

        foreach (var item in cart.Items)
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

        var options = new SessionCreateOptions
        {
            SuccessUrl = domain + cartCheckout.SuccessRoute,
            CancelUrl = domain + cartCheckout.CancelRoute,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItemOptions,
            Mode = "payment",
        };

        var service = new SessionService();
        Session session = service.Create(options);

        return session;
    }


}