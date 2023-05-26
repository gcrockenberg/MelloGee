using Microsoft.AspNetCore.Mvc;

namespace Tea.API.Controllers;

[ApiController]
[Route("[controller]")]
public class TeaController : ControllerBase
{
    private static readonly string[] Teas = new[]
    {
        "Green", "Peppermint", "Earl Grey", "English Breakfast", "Camomile"
    };

    private readonly ILogger<TeaController> _logger;

    public TeaController(ILogger<TeaController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public ActionResult Get()
    {
        var random = new Random();

        return Ok(Teas[random.Next(Teas.Length)]);
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
