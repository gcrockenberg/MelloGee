namespace Me.Services.Purchase.API.Integration.DomainEventHandlers;

public class OrderStatusChangedToPaidDomainEventHandler : INotificationHandler<OrderStatusChangedToPaidDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger _logger;
    private readonly IBuyerRepository _buyerRepository;
    private readonly IPurchaseIntegrationEventService _purchaseIntegrationEventService;

    public OrderStatusChangedToPaidDomainEventHandler(
        IOrderRepository orderRepository,
        ILogger<OrderStatusChangedToPaidDomainEventHandler> logger,
        IBuyerRepository buyerRepository,
        IPurchaseIntegrationEventService purchaseIntegrationEventService)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _buyerRepository = buyerRepository ?? throw new ArgumentNullException(nameof(buyerRepository));
        _purchaseIntegrationEventService = purchaseIntegrationEventService ?? throw new ArgumentNullException(nameof(purchaseIntegrationEventService));
    }

    public async Task Handle(OrderStatusChangedToPaidDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        PurchaseApiTrace.LogOrderStatusUpdated(_logger, domainEvent.OrderId, nameof(OrderStatus.Paid), OrderStatus.Paid.Id);

        var order = await _orderRepository.GetAsync(domainEvent.OrderId);
        var buyer = order.Buyer;    // await _buyerRepository.FindByIdAsync(order.GetBuyerId.Value.ToString());

        var orderStockList = domainEvent.OrderItems
            .Select(orderItem => new OrderStockItem(orderItem.ProductId, orderItem.GetUnits()));

        var integrationEvent = new OrderStatusChangedToPaidIntegrationEvent(
            domainEvent.OrderId,
            order.OrderStatus.Name,
            buyer.Name,
            orderStockList);

        await _purchaseIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
