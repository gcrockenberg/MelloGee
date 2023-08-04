namespace Me.Services.Catalog.API.IntegrationEvents.Events;


/// <summary>
/// An Event is "something that has happened in the past", therefore its name should reflect that
/// An Integration Event usually triggers side effects in other microservices, Bounded-Contexts or external systems.
/// This event is initiated in Order service resulting in updates in the Catalog service
/// </summary>
public record OrderStatusChangedToPaidIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; }
    public IEnumerable<OrderStockItem> OrderStockItems { get; }

    public OrderStatusChangedToPaidIntegrationEvent(int orderId,
        IEnumerable<OrderStockItem> orderStockItems)
    {
        OrderId = orderId;
        OrderStockItems = orderStockItems;
    }
}