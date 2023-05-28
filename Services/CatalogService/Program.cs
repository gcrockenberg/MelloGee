using Azure.Core;
using Azure.Core.Diagnostics;
using Azure.Identity;
using CatalogService.Database;
using CatalogService.Model;
using CatalogService.SyncDataServices.Http;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Vault:Name defined in appsettings.json
var keyVaultEndpoint = new Uri($"https://{builder.Configuration["Vault:Name"]}.vault.azure.net/");
if (builder.Environment.IsDevelopment())
{
    //
    // The following is only to accommodate local dev Docker containers.
    // Better to stick with DefaultAzureCredential but, in order to work on Docker,
    // would have to include the larger az client in the image
    // see https://github.com/Azure/azure-sdk-for-net/issues/19167
    //
    TokenCredential credential = new ClientSecretCredential(
        builder.Configuration["Vault:AZURE_TENANT_ID"],
        builder.Configuration["Vault:AZURE_CLIENT_ID"],
        builder.Configuration["Vault:AZURE_CLIENT_SECRET"]);
    builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, credential);
}
else
{
    // using AzureEventSourceListener listener = AzureEventSourceListener.CreateConsoleLogger();
    // DefaultAzureCredentialOptions options = new DefaultAzureCredentialOptions()
    // {
    //     Diagnostics =
    //     {
    //         LoggedHeaderNames = { "x-ms-request-id" },
    //         LoggedQueryParameters = { "api-version" },
    //         IsLoggingContentEnabled = true
    //     }
    // };
    //
    // The following connects to Key Vault fine running locally on Windows in VS Code or Visual Studio
    // Not in Docker container
    //
    //builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, new DefaultAzureCredential(options));
    builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, new DefaultAzureCredential());
}

Console.WriteLine($"KeyVaultTest: {builder.Configuration["KeyVaultConnectionTest"]}");

builder.Services.AddHttpClient<ICoffeeDataClient, HttpCoffeeDataClient>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<Context>(options =>
    options.UseInMemoryDatabase("InMem")
//options.UseSqlServer(builder.Configuration.GetConnectionString("defaultConnection"))   // From appsettings.json
//options.UseSqlServer(builder.Configuration["defaultConnection"])   // From Key Vault
);

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseAuthorization();

app.MapControllers();

app.Run();

