using Me.Services.Cart;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();                               // Extension

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

builder.Services.AddHealthChecks(builder.Configuration);    // Extension
builder.Services.AddRedis(builder.Configuration);           // Extension

//builder.Services.AddTransient<ProductPriceChangedIntegrationEventHandler>();
//builder.Services.AddTransient<OrderStartedIntegrationEventHandler>();

builder.Services.AddTransient<ICartRepository, RedisCartRepository>();
builder.Services.AddTransient<IIdentityService, IdentityService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseServiceDefaults();     // Extension

if (app.Environment.IsDevelopment())
{
    // Since IdentityModel version 5.2.1 (or since Microsoft.AspNetCore.Authentication.JwtBearer version 2.2.0),
    // PII hiding in log files is enabled by default for GDPR concerns.
    // For debugging/development purposes, one can enable additional detail in exceptions by setting IdentityModelEventSource.ShowPII to true.
    //Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
    //app.UseDeveloperExceptionPage();

    // Swagger handled in UseServiceDefaults
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseAuthorization();

// app.MapGrpcService<CartService>();
app.MapControllers();

// var eventBus = app.Services.GetRequiredService<IEventBus>();

// eventBus.Subscribe<ProductPriceChangedIntegrationEvent, ProductPriceChangedIntegrationEventHandler>();
// eventBus.Subscribe<OrderStartedIntegrationEvent, OrderStartedIntegrationEventHandler>();

app.Run();
