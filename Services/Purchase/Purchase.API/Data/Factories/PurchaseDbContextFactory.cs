namespace Me.Services.Purchase.API.Data.Factories;

public class PurchaseDbContextFactory : IDesignTimeDbContextFactory<PurchaseContext>
{
    public PurchaseContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
           .SetBasePath(Path.Combine(Directory.GetCurrentDirectory()))
           .AddJsonFile("appsettings.json")
           .AddEnvironmentVariables()
           .Build();

        var optionsBuilder = new DbContextOptionsBuilder<PurchaseContext>();

        static void ConfigureSqlOptions(MySqlDbContextOptionsBuilder sqlOptions)
        {
            sqlOptions.MigrationsAssembly(typeof(Program).Assembly.FullName);

            // Configuring Connection Resiliency: https://docs.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency 
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 15,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        };

// To provide the connection string for Migrations
// $env:ConnectionStrings__PurchaseDb='server=localhost;port=3306;uid=root;password=;database=Me.Services.PurchaseDb'
        var connectionString = config.GetConnectionString("PurchaseDb");
        //optionsBuilder.UseSqlServer(config["ConnectionString"], sqlServerOptionsAction: o => o.MigrationsAssembly("Purchase.API"));
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), ConfigureSqlOptions);

        return new PurchaseContext(optionsBuilder.Options);
    }
}
