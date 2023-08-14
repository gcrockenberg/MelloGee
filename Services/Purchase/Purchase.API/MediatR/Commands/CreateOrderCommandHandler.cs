namespace Me.Services.Purchase.API.MediatR.Commands;

// Resolve ambiguous Order definitions
using Me.Services.Purchase.Domain.AggregatesModel.OrderAggregate;

// Regular CommandHandler
public class CreateOrderCommandHandler
    : IRequestHandler<CreateOrderCommand, bool>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IBuyerRepository _buyerRepository;
    private readonly IIdentityService _identityService;
    private readonly IMediator _mediator;
    private readonly IPurchaseIntegrationEventService _purchaseIntegrationEventService;
    private readonly ILogger<CreateOrderCommandHandler> _logger;

    // Using DI to inject infrastructure persistence Repositories
    public CreateOrderCommandHandler(IMediator mediator,
        IPurchaseIntegrationEventService purchaseIntegrationEventService,
        IOrderRepository orderRepository,
        IBuyerRepository buyerRepository,
        IIdentityService identityService,
        ILogger<CreateOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _buyerRepository = buyerRepository ?? throw new ArgumentNullException(nameof(buyerRepository));
        _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        _purchaseIntegrationEventService = purchaseIntegrationEventService ?? throw new ArgumentNullException(nameof(purchaseIntegrationEventService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<bool> Handle(CreateOrderCommand message, CancellationToken cancellationToken)
    {
        // Add Integration event to clean the cart
        var orderStartedIntegrationEvent = new OrderStartedIntegrationEvent(message.UserId, message.SourceCartSessionId);
        await _purchaseIntegrationEventService.AddAndSaveEventAsync(orderStartedIntegrationEvent);

        var cardTypeId = message.CardTypeId != 0 ? message.CardTypeId : 1;
        var buyer = await _buyerRepository.FindAsync(message.UserId);
        var buyerExisted = buyer is not null;

        if (!buyerExisted)
        {
            buyer = new Buyer(message.UserId, message.UserName);
        }

        var paymentMethod = buyer.VerifyOrAddPaymentMethod(cardTypeId,
                                        $"Payment Method on {DateTime.UtcNow}",
                                        message.CardNumber,
                                        message.CardSecurityNumber,
                                        message.CardHolderName,
                                        message.CardExpiration,
                                        0); // Placeholder for OrderId which is going to be eliminated as parameter

        // Add/Update the Buyer AggregateRoot
        // DDD patterns comment: Add child entities and value-objects through the Order Aggregate-Root
        // methods and constructor so validations, invariants and business logic 
        // make sure that consistency is preserved across the whole aggregate
        var address = new Address(message.Street, message.City, message.State, message.Country, message.ZipCode);
        var order = new Order(message.UserId, message.UserName, address, message.CardTypeId, message.CardNumber, message.CardSecurityNumber, message.CardHolderName, message.CardExpiration);

        foreach (var item in message.OrderItems)
        {
            order.AddOrderItem(item.ProductId, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
        }

        order.Buyer = buyer;
        order.PaymentMethod = paymentMethod;

        _logger.LogInformation("Creating Order - Order: {@Order}", order);

        await _orderRepository.Add(order);

        bool result = await _orderRepository.UnitOfWork
            .SaveEntitiesAsync(cancellationToken);

        if (result) // else fire failure event? what about cart?
        {            
            var integrationEvent = new OrderStatusChangedToSubmittedIntegrationEvent(order.Id, order.OrderStatus.Name, order.Buyer.Name);
            await _purchaseIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
            PurchaseApiTrace.LogOrderBuyerAndPaymentValidatedOrUpdated(_logger, order.BuyerId, order.Id);
        }

        return result;
    }
}


// Use for Idempotency in Command process
public class CreateOrderIdentifiedCommandHandler : IdentifiedCommandHandler<CreateOrderCommand, bool>
{
    public CreateOrderIdentifiedCommandHandler(
        IMediator mediator,
        IRequestManager requestManager,
        ILogger<IdentifiedCommandHandler<CreateOrderCommand, bool>> logger)
        : base(mediator, requestManager, logger)
    {
    }

    protected override bool CreateResultForDuplicateRequest()
    {
        return true; // Ignore duplicate requests for creating order.
    }
}
