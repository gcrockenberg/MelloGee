namespace Me.Cart.API.IntegrationEvents.EventHandlers;

public class ProductPriceChangedIntegrationEventHandler : IIntegrationEventHandler<ProductPriceChangedIntegrationEvent>
{
    private readonly ILogger<ProductPriceChangedIntegrationEventHandler> _logger;
    private readonly ICartRepository _repository;

    public ProductPriceChangedIntegrationEventHandler(
        ILogger<ProductPriceChangedIntegrationEventHandler> logger,
        ICartRepository repository)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public async Task Handle(ProductPriceChangedIntegrationEvent @event)
    {
        using (_logger.BeginScope(new List<KeyValuePair<string, object>> { new ("IntegrationEventContext", @event.Id) }))
        {
            _logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

            var cartIds = _repository.GetCartIds();

            foreach (var cartId in cartIds)
            {
                var cart = await _repository.GetCartAsync(cartId);

                await UpdatePriceInCartItems(@event.ProductId, @event.NewPrice, @event.OldPrice, cart);
            }
        }
    }

    private async Task UpdatePriceInCartItems(int productId, decimal newPrice, decimal oldPrice, CustomerCart cart)
    {
        var itemsToUpdate = cart?.Items?.Where(x => x.ProductId == productId).ToList();

        if (itemsToUpdate != null)
        {
            _logger.LogInformation("ProductPriceChangedIntegrationEventHandler - Updating items in basket for session: {SessionId} ({@Items})", cart.SessionId, itemsToUpdate);

            foreach (var item in itemsToUpdate)
            {
                if (item.UnitPrice == oldPrice)
                {
                    var originalPrice = item.UnitPrice;
                    item.UnitPrice = newPrice;
                    item.OldUnitPrice = originalPrice;
                }
            }
            await _repository.UpdateCartAsync(cart);
        }
    }
}
