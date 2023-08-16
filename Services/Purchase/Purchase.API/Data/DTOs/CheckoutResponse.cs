namespace Me.Services.Purchase.API.Data.DTOs;

public class CheckoutResponse
{
    public int OrderId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}