namespace Me.Services.Cart.API.IntegrationEvents.Events;

/// <summary>
/// An Event is "something that has happened in the past", therefore its name should reflect that
/// An Integration Event usually triggers side effects in other microservices, Bounded-Contexts or external systems.
/// This event is initiated in Catalog service resulting in updates in the Cart service
/// </summary>
public record ProductPriceChangedIntegrationEvent : IntegrationEvent
{
    public int ProductId { get; private init; }

    public decimal NewPrice { get; private init; }

    public decimal OldPrice { get; private init; }

    public ProductPriceChangedIntegrationEvent(int productId, decimal newPrice, decimal oldPrice)
    {
        ProductId = productId;
        NewPrice = newPrice;
        OldPrice = oldPrice;
    }
}
