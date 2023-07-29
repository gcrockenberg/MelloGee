using System.ComponentModel.Design;

[Route("api/v1/[controller]")]
[ApiController]
public class OrderController : Controller
{
    private readonly ILogger<OrderController> _logger;
    private readonly IConfiguration _configuration;


    public OrderController(ILogger<OrderController> logger, IConfiguration configuration)
    {
        this._logger = logger;
        this._configuration = configuration;
    }


    [Route("create-checkout-session")]
    [HttpPost]
    public ActionResult<KeyValuePair<string, string>> Create()
    {
        // Request.Headers["Referer"].ToString() -> http://localhost:4200/
        // or the production web app url
        var domain = Request.Headers.Referer;

        var options = new SessionCreateOptions
        {
            // domain includes the trailing "/"
            SuccessUrl = domain + "catalog",
            CancelUrl = domain + "catalog",
            PaymentMethodTypes = new List<string>
            {
              "card"
            },
            LineItems = new List<SessionLineItemOptions>
            {
              new SessionLineItemOptions
              {
                PriceData = new SessionLineItemPriceDataOptions
                {
                  Currency = "usd",
                  UnitAmount = 50000,
                  ProductData = new SessionLineItemPriceDataProductDataOptions
                  {
                    Name = "Michael Jackson's - Who's Bad"
                  }
                },
                Quantity = 2
              },
            },
            Mode = "payment",
        };

        var service = new SessionService();
        Session session = service.Create(options);

        KeyValuePair<string, string> kvp = new KeyValuePair<string, string>("url", session.Url);
        // Response.Headers.Add("Location", session.Url);
        // return new StatusCodeResult(303);
        return Ok(kvp);
    }
}