using Microsoft.AspNetCore.Mvc;

namespace Coffee.API.Controllers;

[ApiController]
[Route("[controller]")]
public class CoffeeController : ControllerBase
{
    private static readonly string[] Coffees = new[]
    {
        "Flat White", "Long Black", "Latte", "Americano", "Cappuccino"
    };

    private readonly ILogger<CoffeeController> _logger;

    public CoffeeController(ILogger<CoffeeController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public ActionResult Get()
    {
        Console.WriteLine($"--> Getting coffee for {Request.HttpContext.Connection.RemoteIpAddress?.ToString()}...");
        var random = new Random();

        return Ok(Coffees[random.Next(Coffees.Length)]);
    }

    // [HttpGet(Name = "GetWeatherForecast")]
    // public IEnumerable<WeatherForecast> Get()
    // {
    //     return Enumerable.Range(1, 5).Select(index => new WeatherForecast
    //     {
    //         Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
    //         TemperatureC = Random.Shared.Next(-20, 55),
    //         Summary = Summaries[Random.Shared.Next(Summaries.Length)]
    //     })
    //     .ToArray();
    // }
}
