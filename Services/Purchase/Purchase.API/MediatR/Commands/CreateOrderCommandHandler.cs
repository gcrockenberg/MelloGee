namespace Me.Services.Purchase.API.MediatR.Commands;


// Regular CommandHandler
public class CreateOrderCommandHandler
    : IRequestHandler<CreateOrderCommand, Order>
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

    public async Task<Order> Handle(CreateOrderCommand message, CancellationToken cancellationToken)
    {
        // Add Integration event to clean the cart
        var orderStartedIntegrationEvent = new OrderStartedIntegrationEvent(message.UserId, message.SourceCartSessionId);
        await _purchaseIntegrationEventService.AddAndSaveEventAsync(orderStartedIntegrationEvent);

        // Saving Order emits Buyer and Payment Validation and Creation domain events
        // DDD patterns comment: Add related entities and value-objects through the Order Aggregate-Root
        // methods and constructor so validations, invariants and business logic 
        // make sure that consistency is preserved across the whole aggregate
        var address = new Address(message.Street, message.City, message.State, message.Country, message.ZipCode);
        var order = new Order(message.UserId, message.UserName, address, message.CardTypeId, message.CardNumber,
                              message.CardSecurityNumber, message.CardHolderName, message.CardExpiration,
                              message.StripeMode, message.RedirectUrl, message.ClientSecret);

        foreach (var item in message.OrderItems)
        {
            order.AddOrderItem(item.ProductId, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
        }

        _logger.LogInformation("Creating Order - Order: {@Order}", order);

        await _orderRepository.Add(order);

        var _result = await _orderRepository.UnitOfWork
            .SaveEntitiesAsync(cancellationToken);

        if (_result) // else fire failure event? what about cart?
        {
            return order;
        }

        return null;
    }
}


// Use for Idempotency in Command process
public class CreateOrderIdentifiedCommandHandler : IdentifiedCommandHandler<CreateOrderCommand, Order>
{
    public CreateOrderIdentifiedCommandHandler(
        IMediator mediator,
        IRequestManager requestManager,
        ILogger<IdentifiedCommandHandler<CreateOrderCommand, Order>> logger)
        : base(mediator, requestManager, logger)
    {
    }

    protected override Order CreateResultForDuplicateRequest()
    {
        return null; // Ignore duplicate requests for creating order.
    }
}
