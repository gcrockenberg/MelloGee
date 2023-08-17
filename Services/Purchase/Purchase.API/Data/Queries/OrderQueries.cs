namespace Me.Services.Purchase.API.Data.Queries;

using Me.Services.Purchase.API.Data.DTOs;


public class OrderQueries
    : IOrderQueries
{
    private string _connectionString = string.Empty;

    public OrderQueries(string constr)
    {
        _connectionString = !string.IsNullOrWhiteSpace(constr) ? constr : throw new ArgumentNullException(nameof(constr));
    }


    public async Task<OrderResponse> GetOrderAsync(int id)
    {
        //using var connection = new SqlConnection(_connectionString);
        using var connection = new MySqlConnection(_connectionString);
        connection.Open();

        var result = await connection.QueryAsync<dynamic>(
            @"SELECT o.Id AS ordernumber, 
                o.OrderDate as date, 
                o.Description as description,
                o.Address_City as city, 
                o.Address_Country as country, 
                o.Address_State as state, 
                o.Address_Street as street, 
                o.Address_ZipCode as zipcode,
                os.Name as status, 
                oi.ProductName as productname, 
                oi.Units as units, 
                oi.UnitPrice as unitprice, 
                oi.PictureUrl as pictureurl
            FROM orders o
            LEFT JOIN orderItems oi ON o.Id = oi.orderid 
            LEFT JOIN orderstatus os on o.OrderStatusId = os.Id
            WHERE o.Id=@id"
                , new { id }
            );

        if (result.AsList().Count == 0)
            throw new KeyNotFoundException();

        return MapOrderItems(result);
    }


    public async Task<IEnumerable<OrderSummary>> GetOrdersFromUserAsync(Guid userId)
    {
        //using var connection = new SqlConnection(_connectionString);
        using var connection = new MySqlConnection(_connectionString);
        connection.Open();

        return await connection.QueryAsync<OrderSummary>(
            @"SELECT o.Id as ordernumber,
                o.OrderDate as date,
                os.Name as STATUS, 
                SUM(oi.units*oi.unitprice) as total
            FROM orders o
            LEFT JOIN orderItems oi ON  o.Id = oi.orderid 
            LEFT JOIN orderstatus os on o.OrderStatusId = os.Id                     
            LEFT JOIN buyers ob on o.BuyerId = ob.Id
            WHERE ob.IdentityGuid = @userId
            GROUP BY o.Id, o.OrderDate, os.Name 
            ORDER BY o.Id", 
            new { userId });
    }



    private OrderResponse MapOrderItems(dynamic result)
    {
        var order = new OrderResponse
        {
            orderNumber = result[0].ordernumber,
            date = result[0].date,
            status = result[0].status,
            description = result[0].description,
            street = result[0].street,
            city = result[0].city,
            state = result[0].state,
            zipCode = result[0].zipcode,
            country = result[0].country,
            orderItems = new List<OrderItem>(),
            total = 0
        };

        foreach (dynamic item in result)
        {
            var orderitem = new OrderItem
            {
                productName = item.productname,
                units = item.units,
                unitPrice = (double)item.unitprice,
                pictureUrl = item.pictureurl
            };

            order.total += item.units * item.unitprice;
            order.orderItems.Add(orderitem);
        }

        return order;
    }


}
