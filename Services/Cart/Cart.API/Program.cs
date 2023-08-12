// CORs is enforced by Gateway

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();                               // Extension

builder.Services.AddGrpc();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();

builder.Services.AddHealthChecks(builder.Configuration)    // Extension
    .AddRedis(builder.Configuration);

builder.Services.AddTransient<ProductPriceChangedIntegrationEventHandler>();
builder.Services.AddTransient<OrderStartedIntegrationEventHandler>();               

builder.Services.AddTransient<ICartRepository, RedisCartRepository>();
builder.Services.AddTransient<IIdentityService, IdentityService>();

var app = builder.Build();

app.UseServiceDefaults();     // Extension
app.MapGrpcService<CartService>();

if (app.Environment.IsDevelopment())
{
    // Since IdentityModel version 5.2.1 (or since Microsoft.AspNetCore.Authentication.JwtBearer version 2.2.0),
    // PII hiding in log files is enabled by default for GDPR concerns.
    // For debugging/development purposes, one can enable additional detail in exceptions by setting IdentityModelEventSource.ShowPII to true.
    //Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
    //app.UseDeveloperExceptionPage();

    // Swagger handled in UseServiceDefaults as OpenAPI
}


app.UseAuthorization();

// app.MapGrpcService<CartService>();
app.MapControllers();

var eventBus = app.Services.GetRequiredService<IEventBus>();
eventBus.Subscribe<ProductPriceChangedIntegrationEvent, ProductPriceChangedIntegrationEventHandler>();
eventBus.Subscribe<OrderStartedIntegrationEvent, OrderStartedIntegrationEventHandler>();

app.Run();
