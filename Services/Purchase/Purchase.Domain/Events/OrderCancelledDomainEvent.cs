namespace Me.Services.Purchase.Domain.Events;

public class OrderCancelledDomainEvent : INotification
{
    public Order Order { get; }

    public OrderCancelledDomainEvent(Order order)
    {
        Order = order;
    }
}
