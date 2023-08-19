namespace Me.Services.Purchase.API.Data.DTOs;

public record OrderItemResponse
{
    public string productName { get; init; } = string.Empty;
    public int units { get; init; }
    public decimal unitPrice { get; init; }
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
    public string stripeMode { get; init; } = string.Empty;
    public string redirectUrl { get; init; } = string.Empty;
    public string clientSecret { get; init; } = string.Empty;
    public decimal total { get; set; } = 0;
    public List<OrderItemResponse> orderItems { get; set; } = new List<OrderItemResponse>();


    public OrderResponse() { }

    public OrderResponse(Order order)
    {
        orderNumber = order.Id;
        date = order.OrderDate;
        status = order.OrderStatus.Name;
        description = order.Description;
        street = order.Address.Street;
        city = order.Address.City;
        state = order.Address.State;
        zipCode = order.Address.ZipCode;
        country = order.Address.Country;
        stripeMode = order.StripeMode;
        redirectUrl = order.RedirectUrl;
        clientSecret = order.ClientSecret;

        foreach (var item in order.OrderItems)
        {
            var orderItem = new OrderItemResponse()
            {
                pictureUrl = item.GetPictureUri(),
                productName = item.GetOrderItemProductName(),
                unitPrice = item.GetUnitPrice(),
                units = item.GetUnits()
            };
            total += orderItem.units * orderItem.unitPrice;
            orderItems.Add(orderItem);
        }
    }
}

public record OrderSummary
{
    public int orderNumber { get; init; }
    public DateTime date { get; init; }
    public string status { get; init; } = string.Empty;
    public double total { get; init; }
}

public record CardType
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
