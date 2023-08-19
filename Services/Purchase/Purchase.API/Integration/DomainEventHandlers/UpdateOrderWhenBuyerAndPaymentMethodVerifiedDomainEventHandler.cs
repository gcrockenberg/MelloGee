namespace Me.Services.Purchase.API.Integration.DomainEventHandlers;

public class UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler : INotificationHandler<BuyerPaymentMethodVerifiedDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IBuyerRepository _buyerRepository;
    private readonly ILogger _logger;

    public UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler(
        IOrderRepository orderRepository,
        IBuyerRepository buyerRepository,
        ILogger<UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler> logger)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _buyerRepository = buyerRepository ?? throw new ArgumentNullException(nameof(buyerRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // Domain Logic comment:
    // When the Buyer and Buyer's payment method have been created or verified that they existed, 
    // then we can update the original Order with the BuyerId and PaymentId (foreign keys)
    public async Task Handle(BuyerPaymentMethodVerifiedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var orderToUpdate = await _orderRepository.GetAsync(domainEvent.OrderId, true);
        var buyer = await _buyerRepository.FindByIdAsync(domainEvent.Buyer.Id);
        var paymentMethod = buyer.PaymentMethods.FirstOrDefault(x => x.Id == domainEvent.Payment.Id);
        
        orderToUpdate.SetBuyer(buyer);
        orderToUpdate.SetPaymentMethod(paymentMethod);
        PurchaseApiTrace.LogOrderPaymentMethodUpdated(_logger, domainEvent.OrderId, nameof(domainEvent.Payment), domainEvent.Payment.Id);
    }
}
