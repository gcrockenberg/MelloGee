namespace Me.Services.Purchase.Infrastructure.Repositories;
public class OrderRepository
    : IOrderRepository
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

    public async Task<Order> GetAsync(int orderId)
    {
        var order = await _context
                            .Orders
                            .Include(o => o.Address)
                            .Include(o => o.Buyer)
                            .FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null)
        {
            order = _context
                        .Orders
                        .Local
                        .FirstOrDefault(o => o.Id == orderId);
        }
        if (order != null)
        {
            await _context.Entry(order)
                .Collection(i => i.OrderItems).LoadAsync();
            await _context.Entry(order)
                .Reference(i => i.OrderStatus).LoadAsync();
        }

        return order;
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
