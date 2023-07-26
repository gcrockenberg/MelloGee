namespace Me.Services.Cart.API.Model;

public class CustomerCart
{
    public string SessionId { get; set; } = string.Empty;
    public List<CartItem> Items { get; set; } = new();


    public CustomerCart() { }


    public CustomerCart(string sessionId)
    {
        SessionId = sessionId;
    }
}