namespace Me.Services.Cart.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class CartController : ControllerBase
{
    private readonly ICartRepository _repository;
    private readonly IIdentityService _identityService;
    private readonly IEventBus _eventBus;
    private readonly ILogger<CartController> _logger;

    public CartController(
        ILogger<CartController> logger,
        ICartRepository repository,
        IIdentityService identityService,
        IEventBus eventBus)
    {
        _logger = logger;
        _repository = repository;
        _identityService = identityService;
        _eventBus = eventBus;
    }


    [HttpGet("{sessionId}")]
    public async Task<ActionResult<CustomerCart>> GetCartBySessionIdAsync(string sessionId)
    {
        string compositeId = sessionId + Request.HttpContext.Connection.RemoteIpAddress;

        var cart = await _repository.GetCartAsync(compositeId);
        if (null != cart)
        {
            cart.SessionId = sessionId;
        }

        return Ok(cart ?? new CustomerCart(sessionId));
    }


    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerCart>> UpdateCartAsync([FromBody] CustomerCart cart)
    {
        string originalBuyerId = cart.SessionId;

        cart.SessionId = originalBuyerId + Request.HttpContext.Connection.RemoteIpAddress;

        if (null == cart || string.IsNullOrEmpty(cart.SessionId))
        {
            return BadRequest();
        }

        cart = await _repository.UpdateCartAsync(cart);
        cart.SessionId = originalBuyerId;

        return Ok(cart);
    }


    [Authorize]
    [RequiredScope("cart.write")]
    [Route("checkout")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KeyValuePair<string, string>>> CheckoutAsync([FromBody] CartCheckout cartCheckout, [FromHeader(Name = "x-requestid")] string requestId)
    {
        var userId = _identityService.GetUserIdentity();

        cartCheckout.RequestId = (Guid.TryParse(requestId, out Guid guid) && guid != Guid.Empty) ?
            guid : cartCheckout.RequestId;

        string compositeId = cartCheckout.CartSessionId + Request.HttpContext.Connection.RemoteIpAddress;
        var cart = await _repository.GetCartAsync(compositeId);
        if (cart == null)
        {
            return BadRequest();
        }

        var session = CreateStripeSession(cartCheckout, cart);
        KeyValuePair<string, string> kvp = new("url", session.Url);
        // TEPORARY FORCE ROUTE TO SUCCESS
        //KeyValuePair<string, string> kvp = new("url", session.SuccessUrl);

        var userName = _identityService.GetUserName();

        var eventMessage = new UserCheckoutAcceptedIntegrationEvent(userId, userName, cartCheckout.City, cartCheckout.Street,
            cartCheckout.State, cartCheckout.Country, cartCheckout.ZipCode, cartCheckout.CardNumber, cartCheckout.CardHolderName,
            cartCheckout.CardExpiration, cartCheckout.CardSecurityNumber, cartCheckout.CardTypeId, cartCheckout.Buyer, cartCheckout.RequestId, cart);

        // Once cart is checkout, sends an integration event to
        // Purchase.API to convert cart to order and proceeds with
        // order creation process
        try
        {
            _eventBus.Publish(eventMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error Publishing integration event: {IntegrationEventId}", eventMessage.Id);

            throw;
        }

        return Accepted(kvp);
    }


    private Session CreateStripeSession(CartCheckout cartCheckout, CustomerCart cart)
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


    // DELETE api/values/5
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task DeleteCartByIdAsync(string id)
    {
        await _repository.DeleteCartAsync(id);
    }
}
