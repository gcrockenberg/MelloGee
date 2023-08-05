namespace Me.Services.Purchase.API.Services;

public interface ICartService
{
    Task<CustomerCart> GetBySessionIdAsync(string id);

    //Task UpdateAsync(CartData currentBasket);
}