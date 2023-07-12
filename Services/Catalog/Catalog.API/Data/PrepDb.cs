namespace Me.Services.Catalog.API.Data;

public static class PrepDb
{
    public static void PrepPopulation(IApplicationBuilder app, ILogger logger) 
    {
        using(var serviceScope = app.ApplicationServices.CreateScope())
        {
            SeedData(serviceScope.ServiceProvider.GetService<CatalogContext>(), logger);
        }        
    }

    private static async Task SeedData(CatalogContext context, ILogger logger)
    {
        if (!context.CatalogItems.Any())
        {
            logger.LogInformation("--> Seeding data...");

            await context.CatalogBrands.AddRangeAsync(CatalogContextSeed.GetPreconfiguredCatalogBrands());
            await context.SaveChangesAsync();

            await context.CatalogTypes.AddRangeAsync(CatalogContextSeed.GetPreconfiguredCatalogTypes());
            await context.SaveChangesAsync();

            await context.CatalogItems.AddRangeAsync(CatalogContextSeed.GetPreconfiguredItems());
            await context.SaveChangesAsync();
        }
        else
        {
            logger.LogInformation("--> We already have data");
        }
    }
}