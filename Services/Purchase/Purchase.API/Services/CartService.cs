namespace Me.Services.Purchase.API.Services;

public class CartService : ICartService
{
    private readonly Cart.CartClient _cartClient;
    private readonly ILogger<CartService> _logger;

    public CartService(Cart.CartClient cartClient, ILogger<CartService> logger)
    {
        _cartClient = cartClient;
        _logger = logger;
    }

    public async Task<CustomerCart> GetBySessionIdAsync(string id)
    {
        _logger.LogDebug("grpc client created, request = {@id}", id);
        var response = await _cartClient.GetCartBySessionIdAsync(new CartRequest { Id = id });
        _logger.LogDebug("grpc response {@response}", response);

        return MapToCustomerCart(response);
    }


    public async Task UpdateAsync(CartData currentCart)
    {
        _logger.LogDebug("Grpc update basket currentCart {@currentCart}", currentCart);
        var request = MapToCustomerCartRequest(currentCart);
        _logger.LogDebug("Grpc update basket request {@request}", request);

        await _cartClient.UpdateCartAsync(request);
    }


    private static CustomerCart MapToCustomerCart(CustomerCartResponse customerCartRequest)
    {
        if (customerCartRequest == null)
        {
            return null;
        }

        var map = new CustomerCart(customerCartRequest.Sessionid, new List<CartItem>());

        customerCartRequest.Items.ToList().ForEach(item =>
        {
            if (item.Id != null)
            {
                map.Items.Add(new CartItem
                {
                    Id = item.Id,
                    OldUnitPrice = (decimal)item.Oldunitprice,
                    PictureUrl = item.Pictureurl,
                    ProductId = item.Productid,
                    ProductName = item.Productname,
                    Quantity = item.Quantity,
                    UnitPrice = (decimal)item.Unitprice
                });
            }
        });

        return map;
    }


    private static CustomerCartRequest MapToCustomerCartRequest(CartData cartData)
    {
        if (cartData == null)
        {
            return null;
        }

        var map = new CustomerCartRequest
        {
            Sessionid = cartData.SessionId
        };

        cartData.Items.ToList().ForEach(item =>
        {
            if (item.Id != null)
            {
                map.Items.Add(new CartItemResponse
                {
                    Id = item.Id,
                    Oldunitprice = (double)item.OldUnitPrice,
                    Pictureurl = item.PictureUrl,
                    Productid = item.ProductId,
                    Productname = item.ProductName,
                    Quantity = item.Quantity,
                    Unitprice = (double)item.UnitPrice
                });
            }
        });

        return map;
    }
}
