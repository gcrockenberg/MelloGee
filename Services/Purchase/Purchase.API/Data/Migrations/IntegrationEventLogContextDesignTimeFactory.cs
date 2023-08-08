namespace Me.Services.Purchase.API.Data.Migrations.IntegrationEvent;

public class IntegrationEventLogContextDesignTimeFactory : IDesignTimeDbContextFactory<IntegrationEventLogContext>
{
    public IntegrationEventLogContext CreateDbContext(string[] args)
    {
        // --------------------- MariaDb ----------------------------------------------
        // LTS version specified in Dockerfile
        // https://hub.docker.com/_/mariadb/tags
        var serverVersion = new MariaDbServerVersion(new Version(11, 0, 2));
        var optionsBuilder = new DbContextOptionsBuilder<IntegrationEventLogContext>();

        optionsBuilder.UseMySql("server=localhost;port=3306;uid=root;password=;database=Me.Services.CatalogDb", 
            serverVersion, options => options.MigrationsAssembly(GetType().Assembly.GetName().Name));
        //optionsBuilder.UseSqlServer(".", options => options.MigrationsAssembly(GetType().Assembly.GetName().Name));

        return new IntegrationEventLogContext(optionsBuilder.Options);
    }
}