namespace Me.Services.Purchase.API.Data.DTOs;

/// <summary>
/// Returned for Cart checkout and Order checkout
/// Cart checkout creates the Order and clears the Cart, only the Order Id is returned
/// Order checkout activates Stripe payment, either url or client secret is returned based upon mode
/// </summary>
public class CheckoutResponse
{
    public int OrderId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}