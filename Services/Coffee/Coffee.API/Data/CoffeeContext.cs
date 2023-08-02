using Microsoft.EntityFrameworkCore;

namespace Me.Services.Coffee.API.Data;

public class CoffeeContext : DbContext
{
    public CoffeeContext(DbContextOptions<CoffeeContext> options) : base(options)
    {
    }


    public DbSet<CoffeeItem> CoffeeItems { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasSequence("CoffeeSequence").IncrementsBy(10);
        builder.ApplyConfiguration(new CoffeeItemEntityTypeConfiguration());
    }

}


public class CoffeeContextDesignFactory : IDesignTimeDbContextFactory<CoffeeContext>
{
    public CoffeeContext CreateDbContext(string[] args)
    {
        // Expose port in Docker
        var connectionString = "server=localhost;port=3306;uid=root;password=;database=coffeedb";
        // LTS version specified in Dockerfile https://hub.docker.com/_/mariadb/tags
        var serverVersion = new MariaDbServerVersion(new Version(11, 0, 2));
        var optionsBuilder = new DbContextOptionsBuilder<CoffeeContext>()
            .UseMySql(connectionString, serverVersion);
            //.UseInMemoryDatabase("InMemDb");
            //.UseMySQL("server=me-my-sql;database=coffeedb;user=root;password=my-secret-password");

        return new CoffeeContext(optionsBuilder.Options);
    }
}