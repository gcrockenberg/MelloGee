namespace Me.Services.Purchase.API.Repositories;

public interface ICartRepository
{
    Task<CustomerCart> GetCartAsync(string cartId);
}