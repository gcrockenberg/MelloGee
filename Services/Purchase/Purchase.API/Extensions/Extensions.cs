namespace Me.Services.Purchase.API.Extensions;

internal static class Extensions
{
    public static IServiceCollection AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var hcBuilder = services.AddHealthChecks();

        hcBuilder
            .AddSqlServer(_ =>
                configuration.GetRequiredConnectionString("PurchaseDb"),
                name: "PurchaseDb-check",
                tags: new string[] { "ready" });

        return services;
    }


    public static IServiceCollection AddDbContexts(this IServiceCollection services, IConfiguration configuration)
    {
        var logger = services.BuildServiceProvider().GetRequiredService<ILogger<DbContext>>();

// To provide the connection string for Migrations
// $env:ConnectionStrings__PurchaseDb='server=localhost;port=3306;uid=root;password=;database=Me.Services.PurchaseDb'
        var connectionString = configuration.GetRequiredConnectionString("PurchaseDb");
        // static void ConfigureSqlOptions(SqlServerDbContextOptionsBuilder sqlOptions)
        // {
        //     sqlOptions.MigrationsAssembly(typeof(Program).Assembly.FullName);

        //     // Configuring Connection Resiliency: https://docs.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency 

        //     sqlOptions.EnableRetryOnFailure(maxRetryCount: 15, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null);
        // };

        static void ConfigureSqlOptions(MySqlDbContextOptionsBuilder sqlOptions)
        {
            sqlOptions.MigrationsAssembly(typeof(Program).Assembly.FullName)
            // Configuring Connection Resiliency: https://docs.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency 
                .EnableRetryOnFailure(
                    maxRetryCount: 15, 
                    maxRetryDelay: TimeSpan.FromSeconds(30), 
                    errorNumbersToAdd: null);
        };

        services.AddDbContext<PurchaseContext>(options =>
        {
            // MariaDb
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), ConfigureSqlOptions);
            // The following three options help with debugging, but should
            // be changed or removed for production.
            //  .LogTo(Console.WriteLine, LogLevel.Trace)
            //  .EnableSensitiveDataLogging()
            //  .EnableDetailedErrors();

            // SQL Server
            //options.UseSqlServer(connectionString, ConfigureSqlOptions);
        });

        services.AddDbContext<IntegrationEventLogContext>(options =>
        {
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), ConfigureSqlOptions);
            // .LogTo(Console.WriteLine, LogLevel.Trace)
            //  .EnableSensitiveDataLogging()
            //  .EnableDetailedErrors();
            //options.UseSqlServer(connectionString, ConfigureSqlOptions);
        });

        return services;
    }


    public static IServiceCollection AddGrpcServices(this IServiceCollection services)
    {
        services.AddTransient<GrpcExceptionInterceptor>();

        services.AddScoped<ICartService, CartService>();

        services.AddGrpcClient<Cart.CartClient>((services, options) =>
        {            
            var grpcCart = services.GetRequiredService<IConfiguration>()["GrpcCart"];
            services.GetRequiredService<ILogger<Cart.CartClient>>().LogInformation("--> Adding gRPC Cart endpoint: {grpcCart}", grpcCart);
            options.Address = new Uri(grpcCart);
        }).AddInterceptor<GrpcExceptionInterceptor>();

        return services;
    }


    public static IServiceCollection AddIntegrationServices(this IServiceCollection services)
    {
        services.AddTransient<IIdentityService, IdentityService>();
        services.AddTransient<Func<DbConnection, IIntegrationEventLogService>>(
            sp => (DbConnection c) => new IntegrationEventLogService(c));

        services.AddTransient<IPurchaseIntegrationEventService, PurchaseIntegrationEventService>();

        return services;
    }

    public static IServiceCollection AddApplicationOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PurchaseSettings>(configuration);
        services.Configure<ApiBehaviorOptions>(options =>
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

        return services;
    }


    public static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddSingleton(sp =>
        {
            var redisConfig = ConfigurationOptions.Parse(configuration.GetRequiredConnectionString("redis"), true);
            redisConfig.ConnectRetry = 60;
            
            return ConnectionMultiplexer.Connect(redisConfig);
        });
    }

}
