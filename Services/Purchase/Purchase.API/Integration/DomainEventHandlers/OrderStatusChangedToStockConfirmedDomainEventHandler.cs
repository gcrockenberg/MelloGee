namespace Me.Services.Purchase.API.Integration.DomainEventHandlers;

public class OrderStatusChangedToStockConfirmedDomainEventHandler
                : INotificationHandler<OrderStatusChangedToStockConfirmedDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IBuyerRepository _buyerRepository;
    private readonly ILogger _logger;
    private readonly IPurchaseIntegrationEventService _purchaseIntegrationEventService;

    public OrderStatusChangedToStockConfirmedDomainEventHandler(
        IOrderRepository orderRepository,
        IBuyerRepository buyerRepository,
        ILogger<OrderStatusChangedToStockConfirmedDomainEventHandler> logger,
        IPurchaseIntegrationEventService purchaseIntegrationEventService)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _buyerRepository = buyerRepository ?? throw new ArgumentNullException(nameof(buyerRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _purchaseIntegrationEventService = purchaseIntegrationEventService;
    }

    public async Task Handle(OrderStatusChangedToStockConfirmedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        PurchaseApiTrace.LogOrderStatusUpdated(_logger, domainEvent.OrderId, nameof(OrderStatus.StockConfirmed), OrderStatus.StockConfirmed.Id);

        var order = await _orderRepository.GetAsync(domainEvent.OrderId);
        var buyer = order.Buyer; // await _buyerRepository.FindByIdAsync(order.GetBuyerId.Value.ToString());

        var integrationEvent = new OrderStatusChangedToStockConfirmedIntegrationEvent(order.Id, order.OrderStatus.Name, buyer.Name);
        await _purchaseIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
