namespace Me.Services.Purchase.API.Data.Queries;

using Order = DTOs.Order;

public interface IOrderQueries
{
    Task<Order> GetOrderAsync(int id);

    Task<IEnumerable<OrderSummary>> GetOrdersFromUserAsync(Guid userId);

}