// CORs is enforced by Gateway

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();                               // Extension

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

// Application specific services from this project's extensions
builder.Services.AddHealthChecks(builder.Configuration)
    .AddDbContexts(builder.Configuration)
    .AddApplicationOptions(builder.Configuration)
    .AddIntegrationServices();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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



// REVIEW: Database seeding for development. Shouldn't be here in production
// The following retry loop is not needed for SQL Server
// Configuring Connection Resiliency: https://docs.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency 
//      sqlOptions.EnableRetryOnFailure(
var settings = app.Services.GetService<IOptions<CatalogSettings>>();
// Database container startup can vary
var logger = app.Services.GetService<ILogger<CatalogContextSeed>>();
int tryCount = 0, maxAttempts = 6, retryInterval = 10000;
do
{
    try
    {
        logger.LogError("--> DataPrep attempt: {count}", tryCount + 1);
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<CatalogContext>();
            await context.Database.MigrateAsync();

            await new CatalogContextSeed().SeedAsync(context, app.Environment, settings, logger);
            
            var integEventContext = scope.ServiceProvider.GetRequiredService<IntegrationEventLogContext>();
            await integEventContext.Database.MigrateAsync();
            break;
        }
    }
    catch (Exception ex)
    {
        logger.LogError("--> Error attempting to prep database: {ex}", ex);
    }
    if (tryCount < maxAttempts)
    {
        logger.LogInformation("--> Sleeping before retry ...");
        Thread.Sleep(retryInterval);
        tryCount++;
    }
} while (tryCount < maxAttempts);



app.Run();
//app.RunAsync();
