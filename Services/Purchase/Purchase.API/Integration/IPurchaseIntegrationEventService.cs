namespace Me.Services.Purchase.API.Integration;

public interface IPurchaseIntegrationEventService
{
    Task PublishEventsThroughEventBusAsync(Guid transactionId);
    Task AddAndSaveEventAsync(IntegrationEvent evt);
}
