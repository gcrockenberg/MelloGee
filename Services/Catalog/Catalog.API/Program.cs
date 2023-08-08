// CORs is enforced by Gateway

var builder = WebApplication.CreateBuilder(args);

// When testing on dektop outside of Docker
// builder.Services.AddCors(options =>
// {
//     options.AddDefaultPolicy(
//         policy =>
//         {
//             policy.WithOrigins("*").WithHeaders("*");
//         });
// });


builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
builder.AddServiceDefaults();                               // Extension

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

// Services defined in extensions
builder.Services.AddHealthChecks(builder.Configuration)
    .AddDbContexts(builder.Configuration)
    .AddApplicationOptions(builder.Configuration)
    .AddIntegrationServices();

builder.Services.AddTransient<OrderStatusChangedToAwaitingValidationIntegrationEventHandler>();
builder.Services.AddTransient<OrderStatusChangedToPaidIntegrationEventHandler>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// When dugging on dektop outside of Docker
// app.UseCors();

app.UseServiceDefaults();

// Expose Swagger so APIM can import APIs
// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.MapPicApi();
app.MapControllers();

var eventBus = app.Services.GetRequiredService<IEventBus>();
eventBus.Subscribe<OrderStatusChangedToAwaitingValidationIntegrationEvent, OrderStatusChangedToAwaitingValidationIntegrationEventHandler>();
eventBus.Subscribe<OrderStatusChangedToPaidIntegrationEvent, OrderStatusChangedToPaidIntegrationEventHandler>();

using (var scope = app.Services.CreateScope())
{
    var settings = app.Services.GetService<IOptions<CatalogSettings>>();
    var logger = app.Services.GetService<ILogger<CatalogContextSeed>>();
    var context = scope.ServiceProvider.GetRequiredService<CatalogContext>();
    await context.Database.MigrateAsync();

    await new CatalogContextSeed().SeedAsync(context, app.Environment, settings, logger);

    var integEventContext = scope.ServiceProvider.GetRequiredService<IntegrationEventLogContext>();
    await integEventContext.Database.MigrateAsync();
}

app.Run();
//app.RunAsync();
