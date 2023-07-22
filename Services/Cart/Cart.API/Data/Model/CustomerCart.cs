namespace Me.Services.Cart.API.Model;

public class CustomerCart
{
    public string BuyerId { get; set; } = string.Empty;

    public List<CartItem> Items { get; set; } = new();


    public CustomerCart() { }


    public CustomerCart(string customerId)
    {
        BuyerId = customerId;
    }
}