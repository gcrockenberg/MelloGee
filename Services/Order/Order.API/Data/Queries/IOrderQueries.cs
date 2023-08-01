namespace Me.Services.Order.API.Data.Queries;

public interface IOrderQueries
{
    Task<CustomerOrder> GetOrderAsync(int id);

    Task<IEnumerable<OrderSummary>> GetOrdersFromUserAsync(Guid userId);

}