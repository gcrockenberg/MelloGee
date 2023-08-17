namespace Me.Services.Purchase.API.Data.Queries;

public interface IOrderQueries
{
    Task<OrderResponse> GetOrderAsync(int id);

    Task<IEnumerable<OrderSummary>> GetOrdersFromUserAsync(Guid userId);

}