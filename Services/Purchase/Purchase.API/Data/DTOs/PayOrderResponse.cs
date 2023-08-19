namespace Me.Services.Purchase.API.Data.DTOs;

public class PayOrderResponse
{
    public required OrderResponse Order { get; set; }
    public required CheckoutData Payment { get; set; }
}