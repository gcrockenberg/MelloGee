using CatalogService.SyncDataServices.Http;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        const string DEPL_SANITY_CHECK = "20230621.1";

        private static readonly string[] Summaries = new[]
        {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };
        private readonly ICoffeeDataClient _coffeeDataClient;
        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, ICoffeeDataClient coffeeDataClient)
        {
            _coffeeDataClient = coffeeDataClient;
            _logger = logger;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public async Task<IEnumerable<WeatherForecast>> Get()
        {
            Console.WriteLine("--> Getting forecasts ...");

            // Test service to service communication - name resolution
            try
            {
                await _coffeeDataClient.GetCoffee();
                Console.WriteLine($"--> Got coffee too");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"--> Could not get coffee");
            }


            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = $"{Summaries[Random.Shared.Next(Summaries.Length)]}:{DEPL_SANITY_CHECK}:IsHttps:{HttpContext.Request.IsHttps}"
            })
            .ToArray();
        }
    }
}