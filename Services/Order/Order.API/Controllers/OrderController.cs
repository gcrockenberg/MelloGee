

namespace Me.Services.Order.API.Controllers;

[Route("api/v1/[controller]")]
[Authorize]
[ApiController]
public class OrderController : ControllerBase
{

    // [HttpGet]
    // [ProducesResponseType(typeof(IEnumerable<OrderSummary>), StatusCodes.Status200OK)]
    // public async Task<ActionResult<IEnumerable<OrderSummary>>> GetOrdersAsync()
    // {
    //     var userid = _identityService.GetUserIdentity();
    //     var orders = await _orderQueries.GetOrdersFromUserAsync(Guid.Parse(userid));

    //     return Ok(orders);
    // }

}