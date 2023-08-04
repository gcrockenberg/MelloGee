namespace Me.Services.Purchase.API.Integration.Events;

public record GracePeriodConfirmedIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; }

    public GracePeriodConfirmedIntegrationEvent(int orderId) =>
        OrderId = orderId;
}

