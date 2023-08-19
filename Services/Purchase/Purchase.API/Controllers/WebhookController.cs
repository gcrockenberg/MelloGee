namespace Me.Services.Purchase.API.Controllers;

using Stripe;

/// <summary>
/// https://stripe.com/docs/webhooks/quickstart
/// To test locally run the following in Powershell
/// stripe listen --forward-to localhost/webhook 
/// </summary>
[Route("[controller]")]
[ApiController]
public class WebhookController : Controller
{
    private readonly string ENDPOINT_SECRET;
    private readonly ILogger<WebhookController> _logger;
    private readonly IMediator _mediator;

    public WebhookController(IConfiguration configuration, ILogger<WebhookController> logger, IMediator mediator)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));

        ENDPOINT_SECRET = configuration["stripe-endpoint-secret"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(ENDPOINT_SECRET)) throw new ArgumentNullException(nameof(ENDPOINT_SECRET));

        logger.LogInformation("--> Verified endpoint: {endpoint}", ENDPOINT_SECRET);
    }


    // [HttpGet]
    // public ActionResult GetJiggyWithIt()
    // {
    //     return Ok("Na, na, na, na, na");
    // }


    [HttpPost]
    public async Task<IActionResult> Index()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        try
        {
            var stripeEvent = EventUtility.ParseEvent(json);
            var signatureHeader = Request.Headers["Stripe-Signature"];

            _logger.LogInformation("--> Constructing event");
            stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, ENDPOINT_SECRET);
            _logger.LogInformation("--> Event constructed");
            
            if (stripeEvent.Type == Events.PaymentIntentSucceeded)
            {
                await HandlePaymentIntentSucceededAsync(stripeEvent.Data.Object as PaymentIntent);
            }
            else if (stripeEvent.Type == Events.PaymentMethodAttached)
            {
                var paymentMethod = stripeEvent.Data.Object as PaymentMethod;
                // Then define and call a method to handle the successful attachment of a PaymentMethod.
                // handlePaymentMethodAttached(paymentMethod);
            }
            else
            {
                _logger.LogInformation("Unhandled event type: {0}", stripeEvent.Type);
            }
            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError("Error: {0}", e.Message);
            return BadRequest();
        }
        catch (Exception)
        {
            return StatusCode(500);
        }
    }


    async Task HandlePaymentIntentSucceededAsync(PaymentIntent paymentIntent)
    {
        _logger.LogInformation("A successful payment for {0} was made.", paymentIntent?.Amount);
        string orderNumber = string.Empty;

        orderNumber = paymentIntent.Metadata.GetValueOrDefault(ORDER_NUMBER_TAG);
        if (string.IsNullOrEmpty(orderNumber))
        {
            _logger.LogError("Payment webhook received without order number");
            return;
        }
        _logger.LogTrace("Payment webhook received with order number {orderNumber}", orderNumber);

        int orderId;
        if (!int.TryParse(orderNumber, out orderId))
        {
            _logger.LogError("Payment webhook received with invalid order number: {orderNumber}", orderNumber);
            return;
        }
        _logger.LogTrace("Payment webhook order number parsed {orderId}", orderId);

        var setPaidOrderStatusCommand = new SetPaidOrderStatusCommand(orderId);
        _logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            setPaidOrderStatusCommand.GetGenericTypeName(),
            nameof(setPaidOrderStatusCommand.OrderNumber),
            setPaidOrderStatusCommand.OrderNumber,
            setPaidOrderStatusCommand);

        if (null == setPaidOrderStatusCommand)
        {
            _logger.LogError("Error creating SetPaidOrderStatusCommand");
            return;
        }
        _logger.LogTrace("SetPaidOrderStatusCommand created.");

        bool commandSuccess = await _mediator.Send(setPaidOrderStatusCommand);
        if (!commandSuccess)
        {
            _logger.LogError("Error invoking SetPaidOrderStatusCommand");
            return;
        }
        _logger.LogTrace("SetPaidOrderStatusCommand successfully invoked.");
    }


}