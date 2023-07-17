var builder = WebApplication.CreateBuilder(args);

// From Common extensions
builder.AddServiceDefaults();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

// Application specific services from this project's extensions
builder.Services.AddApplicationOptions(builder.Configuration);  // Loads CatalogSettings
builder.Services.AddHealthChecks(builder.Configuration);
builder.Services.AddDbContexts(builder.Configuration);
builder.Services.AddIntegrationServices();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Expose Swagger so APIM can import APIs
// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapPicApi();
app.MapControllers();

// REVIEW: This is done for development east but shouldn't be here in production
var settings = app.Services.GetService<IOptions<CatalogSettings>>();
if (settings.Value.InMemoryDatabase)
{
    PrepDb.PrepPopulation(app, app.Logger);
}
else
{
    // SQL Database
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<CatalogContext>();
        var logger = app.Services.GetService<ILogger<CatalogContextSeed>>();
        await context.Database.MigrateAsync();

        await new CatalogContextSeed().SeedAsync(context, app.Environment, settings, logger);
        // var integEventContext = scope.ServiceProvider.GetRequiredService<IntegrationEventLogContext>();
        // await integEventContext.Database.MigrateAsync();
    }
}


app.Run();
//app.RunAsync();
