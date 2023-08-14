var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.AddServiceDefaults();
builder.Services.AddSignalR(builder.Configuration);

builder.Services.AddTransient<OrderStatusChangedToSubmittedIntegrationEventHandler>(); 
builder.Services.AddTransient<OrderStatusChangedToAwaitingValidationIntegrationEventHandler>();
builder.Services.AddTransient<OrderStatusChangedToCancelledIntegrationEventHandler>();
builder.Services.AddTransient<OrderStatusChangedToPaidIntegrationEventHandler>();
builder.Services.AddTransient<OrderStatusChangedToShippedIntegrationEventHandler>();
builder.Services.AddTransient<OrderStatusChangedToStockConfirmedIntegrationEventHandler>();

var app = builder.Build();

// Configure gateway proxy too
app.UseWebSockets();

// app.Use(async (context, next) => {
//     LogRequestInfo(context);
//     await next();
//     });

// Must implement CORS here AND at Gateway
// Make sure the CORS middleware is ahead of SignalR.
var origins = app.Configuration["AllowedOrigins"].Split(",");
app.UseCors(builder =>
{
    builder.WithOrigins(origins)
        .AllowAnyHeader()
        .WithMethods("GET", "POST")
        .AllowCredentials();
});

app.UseServiceDefaults();
app.UseAuthorization();

// Hand off thread
app.MapHub<NotificationsHub>("/hub/notificationhub");

var eventBus = app.Services.GetRequiredService<IEventBus>();
eventBus.Subscribe<OrderStatusChangedToAwaitingValidationIntegrationEvent, OrderStatusChangedToAwaitingValidationIntegrationEventHandler>();
eventBus.Subscribe<OrderStatusChangedToStockConfirmedIntegrationEvent, OrderStatusChangedToStockConfirmedIntegrationEventHandler>();
eventBus.Subscribe<OrderStatusChangedToSubmittedIntegrationEvent, OrderStatusChangedToSubmittedIntegrationEventHandler>();
eventBus.Subscribe<OrderStatusChangedToPaidIntegrationEvent, OrderStatusChangedToPaidIntegrationEventHandler>();
eventBus.Subscribe<OrderStatusChangedToShippedIntegrationEvent, OrderStatusChangedToShippedIntegrationEventHandler>();
eventBus.Subscribe<OrderStatusChangedToCancelledIntegrationEvent, OrderStatusChangedToCancelledIntegrationEventHandler>();

app.Run();

static void LogRequestInfo(HttpContext context)
{
    Console.WriteLine("Request method: " + context.Request.Method);
    Console.WriteLine("Request protocol: " + context.Request.Protocol);
    if (null != context.Request.Headers)
    {
        foreach (var header in context.Request.Headers)
        {
            Console.WriteLine($"--> {header.Key} : {header.Value}");
        }
    }
}