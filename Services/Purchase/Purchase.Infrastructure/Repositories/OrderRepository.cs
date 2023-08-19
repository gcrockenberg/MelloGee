namespace Me.Services.Purchase.Infrastructure.Repositories;
public class OrderRepository : IOrderRepository
{
    private readonly PurchaseContext _context;

    public IUnitOfWork UnitOfWork => _context;

    public OrderRepository(PurchaseContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Order> Add(Order order)
    {
        OrderStatus status = await _context.OrderStatus.FirstOrDefaultAsync(os => os.Id == order.OrderStatusId);
        order.OrderStatus = status;
        return _context.Orders.Add(order).Entity;
    }


    public async Task<Order> GetAsync(int orderId, Boolean withBuyer = false, Boolean withStatus = false, Boolean withItems = false, Boolean withAddress = false)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null)
        {
            order = _context
                        .Orders
                        .Local
                        .FirstOrDefault(o => o.Id == orderId);
        }
        if (order is not null)
        {
            if (withItems)
            {
                await _context.Entry(order)
                    .Collection(i => i.OrderItems).LoadAsync();
            }
            if (withStatus)
            {
                await _context.Entry(order)
                    .Reference(i => i.OrderStatus).LoadAsync();
            }
            if (withBuyer)
            {
                await _context.Entry(order)
                .Reference(i => i.Buyer).LoadAsync();
            }
            if (withAddress)
            {
                await _context.Entry(order)
                .Reference(i => i.Address).LoadAsync();
            }
        }

        return order;
    }


    public async Task<OrderStatus> GetOrderStatusAsync(int orderStatusId)
    {
        return await _context.OrderStatus.FirstOrDefaultAsync(os => os.Id == orderStatusId);
    }


    public void SetBuyerLocal(int orderId, int buyerId)
    {
        var order = _context.Orders.Local.SingleOrDefault(o => o.Id == orderId);
        var buyer = _context.Buyers.Local.SingleOrDefault(b => b.Id == buyerId);
    }


    public void Update(Order order)
    {
        _context.Entry(order).State = EntityState.Modified;
    }


}
