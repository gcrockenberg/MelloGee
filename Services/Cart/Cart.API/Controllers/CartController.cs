namespace Me.Services.Cart.API.Controllers;

[Route("api/v1/[controller]")]
//[Authorize]
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
            cart.BuyerId = sessionId;
        }

        return Ok(cart ?? new CustomerCart(sessionId));
    }


    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerCart>> UpdateCartAsync([FromBody] CustomerCart cart)
    {
        string originalBuyerId = cart.BuyerId;

        cart.BuyerId = originalBuyerId + Request.HttpContext.Connection.RemoteIpAddress;

        if (null == cart || string.IsNullOrEmpty(cart.BuyerId))
        {
            return BadRequest();
        }

        cart = await _repository.UpdateCartAsync(cart);
        cart.BuyerId = originalBuyerId;

        return Ok(cart);
    }


    [Route("checkout")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CheckoutAsync([FromBody] CartCheckout cartCheckout, [FromHeader(Name = "x-requestid")] string requestId)
    {
        var userId = _identityService.GetUserIdentity();

        cartCheckout.RequestId = (Guid.TryParse(requestId, out Guid guid) && guid != Guid.Empty) ?
            guid : cartCheckout.RequestId;

        var cart = await _repository.GetCartAsync(userId);

        if (cart == null)
        {
            return BadRequest();
        }

        var userName = User.FindFirst(x => x.Type == ClaimTypes.Name)!.Value;

        var eventMessage = new UserCheckoutAcceptedIntegrationEvent(userId, userName, cartCheckout.City, cartCheckout.Street,
            cartCheckout.State, cartCheckout.Country, cartCheckout.ZipCode, cartCheckout.CardNumber, cartCheckout.CardHolderName,
            cartCheckout.CardExpiration, cartCheckout.CardSecurityNumber, cartCheckout.CardTypeId, cartCheckout.Buyer, cartCheckout.RequestId, cart);

        // Once cart is checkout, sends an integration event to
        // ordering.api to convert cart to order and proceeds with
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

        return Accepted();
    }


    // DELETE api/values/5
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task DeleteCartByIdAsync(string id)
    {
        await _repository.DeleteCartAsync(id);
    }
}
