using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Vault:Name defined in appsettings.json
var keyVaultEndpoint = new Uri($"https://{builder.Configuration["VAULT_NAME"]}.vault.azure.net/");

try
{
    if (builder.Environment.IsDevelopment())
    {
        /**
        * The following is only to accommodate local dev Docker containers.
        * Better to stick with DefaultAzureCredential but, in order to work on Docker,
        * would have to include the larger az client in the image
        * see https://github.com/Azure/azure-sdk-for-net/issues/19167
        */
        TokenCredential credential = new ClientSecretCredential(
            builder.Configuration["Vault:AZURE_TENANT_ID"],
            builder.Configuration["Vault:AZURE_CLIENT_ID"],
            builder.Configuration["Vault:AZURE_CLIENT_SECRET"]);
        builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, credential);
    }
    else
    {
        // The following connects to Key Vault fine running locally on Windows in VS Code or Visual Studio
        // Not in Docker container
        //
        //builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, new DefaultAzureCredential(options));
        builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, new DefaultAzureCredential());
    }

    Console.WriteLine($"--> KeyVaultTest: {builder.Configuration["KeyVaultConnectionTest"]}");
}
catch (Exception ex)
{
    Console.WriteLine($"--> KeyVaultTest: Key Vault is unavailable: {ex.Message}");
}

builder.Services.AddHttpClient<ICoffeeDataClient, HttpCoffeeDataClient>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<Context>(options =>
    options.UseInMemoryDatabase("InMem")
    //options.UseSqlServer(builder.Configuration.GetConnectionString("defaultConnection"))   // From appsettings.json
    //options.UseSqlServer(builder.Configuration["defaultConnection"])   // From Key Vault
);

/// Call extension method to configure health check
builder.Services.AddCustomHealthCheck(builder.Configuration);

var app = builder.Build();

// Expose the health check endpoints
app.MapHealthChecks("/hc", new HealthCheckOptions()
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
app.MapHealthChecks("/liveness", new HealthCheckOptions
{
    Predicate = r => r.Name.Contains("self")
});


// Swagger is used by APIM to import operations using OpenAPI
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseAuthorization();

app.MapControllers();

app.Run();

/// <summary>
/// Extend Program.cs with some defaults
/// </summary>
public partial class Program
{
    public static string Namespace = typeof(Program).Assembly.GetName().Name ?? string.Empty;
    public static string AppName = Namespace.Substring(Namespace.LastIndexOf('.', Namespace.LastIndexOf('.') - 1) + 1);
}

/// <summary>
/// Add some extension methods
/// </summary>
public static class CustomExtensionMethods
{
    /// <summary>
    /// Implement health check
    /// Best practice but also configurable in Container App />
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns></returns>
    public static IServiceCollection AddCustomHealthCheck(this IServiceCollection services, IConfiguration configuration)
    {
        var hcBuilder = services.AddHealthChecks();

        hcBuilder
            .AddCheck("self", () => HealthCheckResult.Healthy());

        return services;
    }

}