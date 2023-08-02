namespace Me.Services.Coffee.API.Data;

public static class PrepDb
{

  // public static void PrepPopulation(IApplicationBuilder app, ILogger logger)
  // {
  //   using (var serviceScope = app.ApplicationServices.CreateScope())
  //   {
  //     CoffeeContext? context = serviceScope.ServiceProvider.GetService<CoffeeContext>();
  //     if (context is not null)
  //     {
  //       _ = SeedData(context, logger);
  //     }
  //   }
  // }


  public static async Task SeedDataAsync(CoffeeContext context, ILogger logger)
  {
    if (!context.CoffeeItems.Any())
    {
      logger.LogInformation("--> Seeding data...");

      // Creates the database if not exists
      context.Database.EnsureCreated(); // Possible redundant - migrations used in Program.cs

      await context.CoffeeItems.AddRangeAsync(new List<CoffeeItem>(){
      // Adds some coffee items
      new CoffeeItem
      {
        Name = "Flat White"
      },
      new CoffeeItem
      {
        Name = "Long Black"
      },
      new CoffeeItem
      {
        Name = "Latte"
      },
      new CoffeeItem
      {
        Name = "Americano"
      },
      new CoffeeItem
      {
        Name = "Cappuccino"
      }
      });
      // Saves changes
      context.SaveChanges();
    }
    else
    {
      logger.LogInformation("--> We already have coffee data");
    }
  }


}