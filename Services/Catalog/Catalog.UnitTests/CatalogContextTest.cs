using Me.Services.Catalog.API;
using Me.Services.Catalog.API.Data;
using Me.Services.Catalog.API.Model;
using Me.Services.Catalog.API.Controllers;
using Me.Services.Catalog.API.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Xunit.Sdk;
using Microsoft.AspNetCore.Builder;
using Xunit.Abstractions;

namespace UnitTest.Catalog;

public class CatalogContextTest
{
    private readonly DbContextOptions<CatalogContext> _dbOptions;
    private readonly ITestOutputHelper output;

    public CatalogContextTest(ITestOutputHelper output)
    {
        this.output = output;
        _dbOptions = new DbContextOptionsBuilder<CatalogContext>()
            .UseInMemoryDatabase(databaseName: "in-memory")
            .Options;

        using var catalogContext = new CatalogContext(_dbOptions);
        _ = PrepDb(catalogContext);
    }


    private async Task PrepDb(CatalogContext catalogContext)
    { 
        await catalogContext.CatalogTypes.AddRangeAsync(CatalogContextSeed.GetPreconfiguredCatalogTypes());
        await catalogContext.CatalogBrands.AddRangeAsync(CatalogContextSeed.GetPreconfiguredCatalogBrands());

        foreach (CatalogItem item in CatalogContextSeed.GetPreconfiguredItems())
        {
            item.CatalogType = catalogContext.CatalogTypes.Where(t => t.Id == item.CatalogTypeId).FirstOrDefault();
            item.CatalogBrand = catalogContext.CatalogBrands.Where(b => b.Id == item.CatalogBrandId).FirstOrDefault();
            catalogContext.CatalogItems.Add(item);
            catalogContext.SaveChanges();             
        }
    }


    [Fact]
    public async Task Get_catalog_items_with_eager_loading_success()
    {
        //Arrange
        var catalogContext = new CatalogContext(_dbOptions);

        //Act
        var catalogItems = catalogContext.CatalogItems
        .Include(item => item.CatalogBrand)
        .Include(item => item.CatalogType)
        .ToList();                

        //Assert
        Assert.IsType<List<CatalogItem>>(catalogItems);
        Assert.True(0 < catalogItems.Count);
        Assert.NotNull(catalogItems[0].CatalogType);
        Assert.NotNull(catalogItems[0].CatalogType.Type);
        Assert.NotEmpty(catalogItems[0].CatalogType.Type);
        // try
        // {
        //     Assert.Fail("Display output");
        // }
        // catch (XunitException e)
        // {
        //     output.WriteLine($"--> Catalog item type: {catalogItems[0].CatalogType.Type}");
        //     throw;
        // }
    }

}


