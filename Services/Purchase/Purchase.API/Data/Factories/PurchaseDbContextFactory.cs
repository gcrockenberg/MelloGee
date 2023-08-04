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

        optionsBuilder.UseSqlServer(config["ConnectionString"], sqlServerOptionsAction: o => o.MigrationsAssembly("Purchase.API"));

        return new PurchaseContext(optionsBuilder.Options);
    }
}
