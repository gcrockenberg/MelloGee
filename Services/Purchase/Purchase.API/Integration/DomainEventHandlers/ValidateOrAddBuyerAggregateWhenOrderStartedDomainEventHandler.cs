namespace Me.Services.Purchase.API.Integration.DomainEventHandlers;

public class ValidateOrAddBuyerAggregateWhenOrderStartedDomainEventHandler
                    : INotificationHandler<OrderStartedDomainEvent>
{
    private readonly ILogger _logger;
    private readonly IBuyerRepository _buyerRepository;
    private readonly IPurchaseIntegrationEventService _purchaseIntegrationEventService;

    public ValidateOrAddBuyerAggregateWhenOrderStartedDomainEventHandler(
        ILogger<ValidateOrAddBuyerAggregateWhenOrderStartedDomainEventHandler> logger,
        IBuyerRepository buyerRepository,
        IPurchaseIntegrationEventService purchaseIntegrationEventService)
    {
        _buyerRepository = buyerRepository ?? throw new ArgumentNullException(nameof(buyerRepository));
        _purchaseIntegrationEventService = purchaseIntegrationEventService ?? throw new ArgumentNullException(nameof(purchaseIntegrationEventService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Handle(OrderStartedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        // Buyer processing integrated in CreateOrderCommandHandler
        var cardTypeId = domainEvent.CardTypeId != 0 ? domainEvent.CardTypeId : 1;
        var buyer = await _buyerRepository.FindAsync(domainEvent.UserId);
        var buyerExisted = buyer is not null;

        if (!buyerExisted)
        {
            buyer = new Buyer(domainEvent.UserId, domainEvent.UserName);
        }

        buyer.VerifyOrAddPaymentMethod(cardTypeId,
                                        $"Payment Method on {DateTime.UtcNow}",
                                        domainEvent.CardNumber,
                                        domainEvent.CardSecurityNumber,
                                        domainEvent.CardHolderName,
                                        domainEvent.CardExpiration,
                                        domainEvent.Order.Id);

        var buyerUpdated = buyerExisted ?
             _buyerRepository.Update(buyer) :
             _buyerRepository.Add(buyer);

        await _buyerRepository.UnitOfWork
             .SaveEntitiesAsync(cancellationToken);

        // Currently, only SignalR listens for this event to relay it to the client
        var integrationEvent = new OrderStatusChangedToSubmittedIntegrationEvent(domainEvent.Order.Id, domainEvent.Order.OrderStatus.Name, buyer.Name);
        await _purchaseIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
        PurchaseApiTrace.LogOrderBuyerAndPaymentValidatedOrUpdated(_logger, buyerUpdated.Id, domainEvent.Order.Id);

        // The integration process will stop if we don't emit the GracePeriod event.
        // Emit GracePeriodConfirmedIE continues Order evolution to verify Stock.
        var gracePeriodConfirmedIE = new GracePeriodConfirmedIntegrationEvent(domainEvent.Order.Id);
        await _purchaseIntegrationEventService.AddAndSaveEventAsync(gracePeriodConfirmedIE);
    }
}
