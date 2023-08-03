using Microsoft.EntityFrameworkCore.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var hcBuilder = services.AddHealthChecks();

        // hcBuilder
        //     .AddSqlServer(_ => configuration.GetRequiredConnectionString("CatalogDB"),
        //         name: "CatalogDB-check",
        //         tags: new string[] { "ready" });

        // var accountName = configuration["AzureStorageAccountName"];
        // var accountKey = configuration["AzureStorageAccountKey"];

        // if (!string.IsNullOrEmpty(accountName) && !string.IsNullOrEmpty(accountKey))
        // {
        //     hcBuilder
        //         .AddAzureBlobStorage(
        //             $"DefaultEndpointsProtocol=https;AccountName={accountName};AccountKey={accountKey};EndpointSuffix=core.windows.net",
        //             name: "catalog-storage-check",
        //             tags: new string[] { "ready" });
        // }

        return services;
    }


    /// <summary>
    /// Catalog and IntegrationEventLog DbContexts in the CatalogDb database.
    /// </summary>
    /// <param name="services">AddDbContext target</param>
    /// <param name="configuration">For DB connection strings</param>
    /// <returns>The services Microsoft.Extensions.DependencyInjection.IMvcBuilder that can be used to further
    /// configure the MVC services.</returns>
    public static IServiceCollection AddDbContexts(this IServiceCollection services, IConfiguration configuration)
    {
        static void ConfigureSqlOptions(SqlServerDbContextOptionsBuilder sqlOptions)
        {
            sqlOptions.MigrationsAssembly(typeof(Program).Assembly.FullName);

            // Configuring Connection Resiliency: https://docs.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency 
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 15,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        };

        services.AddDbContext<CatalogContext>(options =>
        {
            // --------------------- MariaDb ----------------------------------------------
            //var connectionString = builder.Configuration.GetConnectionString("CatalogDb");
            // LTS version specified in Dockerfile
            // https://hub.docker.com/_/mariadb/tags
            //var serverVersion = new MariaDbServerVersion(new Version(11, 0, 2));
            //builder.Services.AddDbContext<CatalogContext>(options =>
            //            options.UseMySql(connectionString, serverVersion));
            // The following three options help with debugging, but should
            // be changed or removed for production.
            // .LogTo(Console.WriteLine, LogLevel.Information)
            // .EnableSensitiveDataLogging()
            // .EnableDetailedErrors());
            // --------------------- End MariaDb ------------------------------------------
            var connectionString = configuration.GetRequiredConnectionString("CatalogDb");

            options.UseSqlServer(connectionString, ConfigureSqlOptions);
        });

        services.AddDbContext<IntegrationEventLogContext>(options =>
        {
            var connectionString = configuration.GetRequiredConnectionString("CatalogDb");

            options.UseSqlServer(connectionString, ConfigureSqlOptions);
        });

        return services;
    }


    /// <summary>
    /// Initialize CatalogSettings from configuration. Register problem detail responses.
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns>The services Microsoft.Extensions.DependencyInjection.IMvcBuilder that can be used to further
    /// configure the MVC services.</returns>
    public static IServiceCollection AddApplicationOptions(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Configure<CatalogSettings>(configuration)
            // TODO: Move to the new problem details middleware
            .Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Instance = context.HttpContext.Request.Path,
                        Status = StatusCodes.Status400BadRequest,
                        Detail = "Please refer to the errors property for additional details."
                    };

                    return new BadRequestObjectResult(problemDetails)
                    {
                        ContentTypes = { "application/problem+json", "application/problem+xml" }
                    };
                };
            });
    }


    /// <summary>
    /// Register transient IIntegrationEventLogService and ICatalogIntegrationEventService
    /// </summary>
    /// <param name="services"></param>
    /// <returns>The services Microsoft.Extensions.DependencyInjection.IMvcBuilder that can be used to further
    /// configure the MVC services.</returns>
    public static IServiceCollection AddIntegrationServices(this IServiceCollection services)
    {
        services.AddTransient<Func<DbConnection, IIntegrationEventLogService>>(
            sp => (DbConnection c) => new IntegrationEventLogService(c));

        services.AddTransient<ICatalogIntegrationEventService, CatalogIntegrationEventService>();

        return services;
    }
}
