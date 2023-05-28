namespace CatalogService.SyncDataServices.Http
{
    public class HttpCoffeeDataClient : ICoffeeDataClient
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public HttpCoffeeDataClient(HttpClient httpClient, IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task GetCoffee()
        {
            await _httpClient.GetAsync($"{_configuration["CoffeeAPI"]}");
        }
    }
}