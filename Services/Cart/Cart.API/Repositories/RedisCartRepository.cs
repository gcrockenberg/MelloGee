namespace Me.Services.Cart.API.Repositories;

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

    public async Task<bool> DeleteCartAsync(string id)
    {
        return await _database.KeyDeleteAsync(id);
    }

    public IEnumerable<string> GetCartIds()
    {
        var server = GetServer();
        var data = server.Keys();

        return data?.Select(k => k.ToString());
    }


    public async Task<CustomerCart> GetCartAsync(string customerId)
    {
        var data = await _database.StringGetAsync(customerId);

        if (data.IsNullOrEmpty)
        {
            return null;
        }
        
        return JsonSerializer.Deserialize<CustomerCart>(data, JsonDefaults.CaseInsensitiveOptions);
    }


    public async Task<CustomerCart> UpdateCartAsync(CustomerCart cart)
    {
        var created = await _database.StringSetAsync(cart.SessionId, JsonSerializer.Serialize(cart, JsonDefaults.CaseInsensitiveOptions));

        if (!created)
        {
            return null;
        }

        return await GetCartAsync(cart.SessionId);
    }


    private IServer GetServer()
    {
        var endpoint = _redis.GetEndPoints();
        return _redis.GetServer(endpoint.First());
    }
}
