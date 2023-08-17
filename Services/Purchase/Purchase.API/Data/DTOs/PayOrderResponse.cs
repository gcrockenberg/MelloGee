namespace Me.Services.Purchase.API.Data.DTOs;

public class PayOrderResponse
{
    public OrderResponse Order { get; set; }
    public CheckoutResponse Payment { get; set; }
}