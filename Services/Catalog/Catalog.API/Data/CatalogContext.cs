namespace Me.Services.Catalog.API.Data;

public class CatalogContext : DbContext
{
    public CatalogContext(DbContextOptions<CatalogContext> options) : base(options)
    {
    }

    public DbSet<CatalogItem> CatalogItems { get; set; } = null!;
    public DbSet<CatalogBrand> CatalogBrands { get; set; } = null!;
    public DbSet<CatalogType> CatalogTypes { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Sequences explicitly declared for Mariadb        
        // builder.HasSequence("CatalogBrandSequence").IncrementsBy(10);
        // builder.HasSequence("CatalogTypeSequence").IncrementsBy(10);
        // builder.HasSequence("CatalogItemSequence").IncrementsBy(10);
        builder.ApplyConfiguration(new CatalogBrandEntityTypeConfiguration());
        builder.ApplyConfiguration(new CatalogTypeEntityTypeConfiguration());
        builder.ApplyConfiguration(new CatalogItemEntityTypeConfiguration());
    }

}


public class CatalogContextDesignFactory : IDesignTimeDbContextFactory<CatalogContext>
{
    public CatalogContext CreateDbContext(string[] args)
    {
        //var connectionString = "server=localhost;port=3306;uid=root;password=;database=Me.Services.CatalogDb";
        // Detected server version: 11.0.2-mariadb
        //var serverVersion = new MariaDbServerVersion(new Version(11, 0, 2));
        var optionsBuilder = new DbContextOptionsBuilder<CatalogContext>()
            //.UseMySql(connectionString, serverVersion);
            .UseSqlServer("Server=.;Initial Catalog=Me.Services.CatalogDb;Integrated Security=true");

        return new CatalogContext(optionsBuilder.Options);
    }
}