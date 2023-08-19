namespace Me.Services.Purchase.API.Data.Models;

public class CartItem
{
    public string Id { get; init; } = string.Empty;
    public int ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public decimal OldUnitPrice { get; init; }
    public int Quantity { get; init; }
    public string PictureUrl { get; init; } = string.Empty;
}