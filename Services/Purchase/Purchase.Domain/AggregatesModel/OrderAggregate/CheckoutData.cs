namespace Me.Services.Purchase.Domain.AggregatesModel.OrderAggregate;

/// <summary>
/// Order checkout activates Stripe payment, either url or client secret is returned based upon mode
/// </summary>
public class CheckoutData
{
    public string StripeMode { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}