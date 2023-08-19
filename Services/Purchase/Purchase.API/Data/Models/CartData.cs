namespace Me.Services.Purchase.API.Data.Models;

public class CartData
{
    public string SessionId { get; set; } = string.Empty;

    public List<CartDataItem> Items { get; set; } = new();

    public CartData()
    {
    }

    public CartData(string sessionId)
    {
        SessionId = sessionId;
    }
}