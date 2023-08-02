var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("CoffeeDb");
// LTS version specified in Dockerfile https://hub.docker.com/_/mariadb/tags
var serverVersion = new MariaDbServerVersion(new Version(11, 0, 2));


builder.Services.AddDbContext<CoffeeContext>(options =>
            options.UseMySql(connectionString, serverVersion);
            // The following three options help with debugging, but should
            // be changed or removed for production.
            //.LogTo(Console.WriteLine, LogLevel.Information)
            //.EnableSensitiveDataLogging()
            //.EnableDetailedErrors()
            //options.UseMySQL(builder.Configuration.GetConnectionString("coffeedb"))
            //options.UseInMemoryDatabase("InMem")
            //options.UseSqlServer(builder.Configuration.GetConnectionString("defaultConnection"))   // From appsettings.json
            //options.UseSqlServer(builder.Configuration["defaultConnection"])   // From Key Vault
);

var app = builder.Build();

// Swagger is used by APIM to import operations using OpenAPI
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

// If enabled then specify ASPNETCORE_HTTPS_PORT: port# in Docker environment
// Not needed behind Gateway
//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Database container availability can vary on startup
var logger = app.Services.GetService<ILogger<CoffeeContext>>();
int tryCount = 0, maxAttempts = 6, retryInterval = 10000;
do
{
    try
    {
        logger.LogError("--> DataPrep attempt: {count}", tryCount + 1);
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<CoffeeContext>();
            await context.Database.MigrateAsync();

            await PrepDb.SeedDataAsync(context, app.Logger);
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
