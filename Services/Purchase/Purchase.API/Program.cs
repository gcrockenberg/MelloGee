using Stripe;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
//builder.Services.AddGrpc();

builder.Services.AddControllers();

// Services defined in extensions
builder.Services.AddHealthChecks(builder.Configuration)
    .AddDbContexts(builder.Configuration)
    .AddApplicationOptions(builder.Configuration)
    .AddIntegrationServices()
    .AddRedis(builder.Configuration);
;

var services = builder.Services;

// Syncronous inter-service communication
services.AddGrpcServices();     // ACA prevents gRPC due to port limitations
services.AddTransient<ICartRepository, RedisCartRepository>();  // Temporarily using direct call to data
// End 

//
// MediatR integration event management
//
services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining(typeof(Program));

    cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
    cfg.AddOpenBehavior(typeof(ValidatorBehavior<,>));
    cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
});

// Register the command validators for the validator behavior (validators based on FluentValidation library)
services.AddSingleton<IValidator<CancelOrderCommand>, CancelOrderCommandValidator>();
services.AddSingleton<IValidator<CreateOrderCommand>, CreateOrderCommandValidator>();
services.AddSingleton<IValidator<IdentifiedCommand<CreateOrderCommand, bool>>, IdentifiedCommandValidator>();
services.AddSingleton<IValidator<ShipOrderCommand>, ShipOrderCommandValidator>();

services.AddScoped<IOrderQueries>(sp => new OrderQueries(builder.Configuration.GetConnectionString("PurchaseDb")));
services.AddScoped<IBuyerRepository, BuyerRepository>();
services.AddScoped<IOrderRepository, OrderRepository>();
services.AddScoped<IRequestManager, RequestManager>();

// Add integration event handlers.
services.AddTransient<IIntegrationEventHandler<GracePeriodConfirmedIntegrationEvent>, GracePeriodConfirmedIntegrationEventHandler>();
services.AddTransient<IIntegrationEventHandler<OrderPaymentFailedIntegrationEvent>, OrderPaymentFailedIntegrationEventHandler>();
services.AddTransient<IIntegrationEventHandler<OrderPaymentSucceededIntegrationEvent>, OrderPaymentSucceededIntegrationEventHandler>();
services.AddTransient<IIntegrationEventHandler<OrderStockConfirmedIntegrationEvent>, OrderStockConfirmedIntegrationEventHandler>();
services.AddTransient<IIntegrationEventHandler<OrderStockRejectedIntegrationEvent>, OrderStockRejectedIntegrationEventHandler>();
services.AddTransient<IIntegrationEventHandler<UserCheckoutAcceptedIntegrationEvent>, UserCheckoutAcceptedIntegrationEventHandler>();

// Domain integration event handlers
services.AddTransient<INotificationHandler<OrderStartedDomainEvent>, ValidateOrAddBuyerAggregateWhenOrderStartedDomainEventHandler>();
services.AddTransient<INotificationHandler<BuyerPaymentMethodVerifiedDomainEvent>, UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler>();
//
// End integration event
//

// Using environment secrets
StripeConfiguration.ApiKey = builder.Configuration["stripe-configuration-apikey"];
Console.WriteLine($"--> Stripe config loaded: {!string.IsNullOrWhiteSpace(StripeConfiguration.ApiKey)}");

var app = builder.Build();

app.UseServiceDefaults();

//app.MapGrpcService<PurchaseService>();
app.MapControllers();

var eventBus = app.Services.GetRequiredService<IEventBus>();

eventBus.Subscribe<UserCheckoutAcceptedIntegrationEvent, IIntegrationEventHandler<UserCheckoutAcceptedIntegrationEvent>>();
eventBus.Subscribe<GracePeriodConfirmedIntegrationEvent, IIntegrationEventHandler<GracePeriodConfirmedIntegrationEvent>>();
eventBus.Subscribe<OrderStockConfirmedIntegrationEvent, IIntegrationEventHandler<OrderStockConfirmedIntegrationEvent>>();
eventBus.Subscribe<OrderStockRejectedIntegrationEvent, IIntegrationEventHandler<OrderStockRejectedIntegrationEvent>>();
eventBus.Subscribe<OrderPaymentFailedIntegrationEvent, IIntegrationEventHandler<OrderPaymentFailedIntegrationEvent>>();
eventBus.Subscribe<OrderPaymentSucceededIntegrationEvent, IIntegrationEventHandler<OrderPaymentSucceededIntegrationEvent>>();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PurchaseContext>();
    await context.Database.MigrateAsync();

    var env = app.Services.GetService<IWebHostEnvironment>();
    var settings = app.Services.GetService<IOptions<PurchaseSettings>>();
    var logger = app.Services.GetService<ILogger<PurchaseContextSeed>>();
    await new PurchaseContextSeed().SeedAsync(context, env, settings, logger);
    var integEventContext = scope.ServiceProvider.GetRequiredService<IntegrationEventLogContext>();
    await integEventContext.Database.MigrateAsync();
}

app.Run();
