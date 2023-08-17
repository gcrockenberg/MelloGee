namespace Me.Services.Purchase.API.Data.DTOs;

public class PayOrderDTO
{
    public OrderDTO Order { get; set; }
    public CheckoutResponse Payment { get; set; }
}