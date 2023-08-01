namespace Me.Services.Catalog.API.Data;

/// <summary>
/// For InMemoryDb
/// </summary>
public static class PrepDb
{
    public static void PrepPopulation(IApplicationBuilder app, ILogger logger)
    {
        using (var serviceScope = app.ApplicationServices.CreateScope())
        {
            CatalogContext? context = serviceScope.ServiceProvider.GetService<CatalogContext>();
            if (context is not null)
            {
                _ = SeedData(context, logger);
            }
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

            foreach (CatalogItem item in CatalogContextSeed.GetPreconfiguredItems())
            {
                item.CatalogType = context.CatalogTypes.Where(t => t.Id == item.CatalogTypeId).FirstOrDefault();
                item.CatalogBrand = context.CatalogBrands.Where(b => b.Id == item.CatalogBrandId).FirstOrDefault();
                await context.CatalogItems.AddAsync(item);
                await context.SaveChangesAsync();
            }
        }
        else
        {
            logger.LogInformation("--> We already have data");
        }
    }
}