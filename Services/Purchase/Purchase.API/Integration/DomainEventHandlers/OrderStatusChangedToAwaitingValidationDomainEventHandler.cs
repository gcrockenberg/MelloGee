namespace Me.Services.Purchase.API.Integration.DomainEventHandlers;

public class OrderStatusChangedToAwaitingValidationDomainEventHandler
                : INotificationHandler<OrderStatusChangedToAwaitingValidationDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger _logger;
    private readonly IBuyerRepository _buyerRepository;
    private readonly IPurchaseIntegrationEventService _purchaseIntegrationEventService;

    public OrderStatusChangedToAwaitingValidationDomainEventHandler(
        IOrderRepository orderRepository,
        ILogger<OrderStatusChangedToAwaitingValidationDomainEventHandler> logger,
        IBuyerRepository buyerRepository,
        IPurchaseIntegrationEventService purchaseIntegrationEventService)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _buyerRepository = buyerRepository;
        _purchaseIntegrationEventService = purchaseIntegrationEventService;
    }

    public async Task Handle(OrderStatusChangedToAwaitingValidationDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        PurchaseApiTrace.LogOrderStatusUpdated(_logger, domainEvent.OrderId, nameof(OrderStatus.AwaitingValidation), OrderStatus.AwaitingValidation.Id);

        var order = await _orderRepository.GetAsync(domainEvent.OrderId);
        var buyer = order.Buyer;    // await _buyerRepository.FindByIdAsync(order.GetBuyerId.Value.ToString());

        var orderStockList = domainEvent.OrderItems
            .Select(orderItem => new OrderStockItem(orderItem.ProductId, orderItem.GetUnits()));

        var integrationEvent = new OrderStatusChangedToAwaitingValidationIntegrationEvent(order.Id, order.OrderStatus.Name, buyer.Name, orderStockList);
        await _purchaseIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
