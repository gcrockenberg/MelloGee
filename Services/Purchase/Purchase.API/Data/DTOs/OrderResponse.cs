namespace Me.Services.Purchase.API.Data.DTOs;

public record OrderItem
{
    public string productName { get; init; } = string.Empty;
    public int units { get; init; }
    public double unitPrice { get; init; }
    public string pictureUrl { get; init; } = string.Empty;
}

public record OrderResponse
{
    public int orderNumber { get; init; }
    public DateTime date { get; init; }
    public string status { get; init; } = string.Empty;
    public string description { get; init; } = string.Empty;
    public string street { get; init; } = string.Empty;
    public string city { get; init; } = string.Empty;
    public string state { get; init; } = string.Empty;
    public string zipCode { get; init; } = string.Empty;
    public string country { get; init; } = string.Empty;
    public decimal total { get; set; }
    public List<OrderItem> orderItems { get; set; }
}

public record OrderSummary
{
    public int orderNumber { get; init; }
    public DateTime date { get; init; }
    public string status { get; init; }
    public double total { get; init; }
}

public record CardType
{
    public int Id { get; init; }
    public string Name { get; init; }
}
