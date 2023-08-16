namespace Me.Services.Purchase.API.Repositories;

using StackExchange.Redis;

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


    public IEnumerable<string> GetCartIds()
    {
        var server = GetServer();
        var data = server.Keys();

        return data?.Select(k => k.ToString());
    }


    private IServer GetServer()
    {
        var endpoint = _redis.GetEndPoints();
        return _redis.GetServer(endpoint.First());
    }
}
