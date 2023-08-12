namespace Me.Services.Purchase.API.Repositories;

public class RedisCartRepository : ICartRepository
{
    private readonly ILogger<RedisCartRepository> _logger;
    private readonly ConnectionMultiplexer _redis;
    private readonly IDatabase _database;

    public RedisCartRepository(ILogger<RedisCartRepository> logger, ConnectionMultiplexer redis)
    {
        _logger = logger;
        _redis = redis;
        _database = redis.GetDatabase();
    }


    public async Task<CustomerCart> GetCartAsync(string cartId)
    {
        var data = await _database.StringGetAsync(cartId);

        if (data.IsNullOrEmpty)
        {
            return null;
        }
        
        return JsonSerializer.Deserialize<CustomerCart>(data, JsonDefaults.CaseInsensitiveOptions);
    }


    private IServer GetServer()
    {
        var endpoint = _redis.GetEndPoints();
        return _redis.GetServer(endpoint.First());
    }
}
