namespace Me.Services.Purchase.Infrastructure.Repositories;

public class BuyerRepository
    : IBuyerRepository
{
    private readonly PurchaseContext _context;
    public IUnitOfWork UnitOfWork => _context;

    public BuyerRepository(PurchaseContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }


    public Buyer Add(Buyer buyer)
    {
        if (buyer.IsTransient())
        {
            return _context.Buyers
                .Add(buyer)
                .Entity;
        }

        return buyer;
    }


    public Buyer Update(Buyer buyer)
    {
        return _context.Buyers
                .Update(buyer)
                .Entity;
    }


    public async Task<Buyer> FindAsync(string identity)
    {
        var buyer = await _context.Buyers
            .Include(b => b.PaymentMethods)
            .Where(b => b.IdentityGuid == identity)
            .SingleOrDefaultAsync();

        return buyer;
    }


    public async Task<Buyer> FindByIdAsync(int buyerId)
    {
        var buyer = await _context.Buyers
            .Include(b => b.PaymentMethods)
            .Where(b => b.Id == buyerId)
            .SingleOrDefaultAsync();
        
        if (buyer is null)
        {
            buyer = _context.Buyers.Local
                .FirstOrDefault(b => b.Id == buyerId);            
        }

        return buyer;
    }

}
