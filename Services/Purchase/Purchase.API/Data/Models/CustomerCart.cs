namespace Me.Services.Purchase.API.Data.Models;

public class CustomerCart
{
    public string SessionId { get; set; }
    public List<CartItem> Items { get; set; }

    public CustomerCart(string sessionId, List<CartItem> items)
    {
        SessionId = sessionId;
        Items = items;
    }
}