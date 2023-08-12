namespace Me.Services.Cart.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class CartController : ControllerBase
{
    private readonly ICartRepository _repository;
    private readonly ILogger<CartController> _logger;

    public CartController(
        ILogger<CartController> logger,
        ICartRepository repository)
    {
        _logger = logger;
        _repository = repository;
    }


    [HttpGet("{sessionId}")]
    public async Task<ActionResult<CustomerCart>> GetCartBySessionIdAsync(string sessionId)
    {
        var cart = await _repository.GetCartAsync(sessionId);
        if (null != cart)
        {
            cart.SessionId = sessionId;
        }

        return Ok(cart ?? new CustomerCart(sessionId));
    }


    /// <summary>
    /// This client Cart keeps the plain SessionId cookie. The Service tracks SessionId + RemoteIpAddress
    /// If the RemoteIpAddress changes then the Cart is lost
    /// </summary>
    /// <param name="cart"></param>
    /// <returns></returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerCart>> UpdateCartAsync([FromBody] CustomerCart cart)
    {
        _logger.LogInformation("--> Cart SessionId: {sessionId}", cart.SessionId);

        if (null == cart || string.IsNullOrEmpty(cart.SessionId))
        {
            return BadRequest();
        }

        cart = await _repository.UpdateCartAsync(cart);

        return Ok(cart);
    }


    // DELETE api/values/5
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task DeleteCartByIdAsync(string id)
    {
        await _repository.DeleteCartAsync(id);
    }


}
