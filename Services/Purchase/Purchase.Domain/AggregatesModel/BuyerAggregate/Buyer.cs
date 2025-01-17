namespace Me.Services.Purchase.Domain.AggregatesModel.BuyerAggregate;

public class Buyer
    : Entity, IAggregateRoot
{
    public string IdentityGuid { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;


    private List<PaymentMethod> _paymentMethods;
    public virtual IEnumerable<PaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();

    public virtual ICollection<Order> Orders { get; } = new List<Order>();


    protected Buyer()
    {
        _paymentMethods = new List<PaymentMethod>();
    }
    

    public Buyer(string identity, string name) : this()
    {
        IdentityGuid = !string.IsNullOrWhiteSpace(identity) ? identity : throw new ArgumentNullException(nameof(identity));
        Name = !string.IsNullOrWhiteSpace(name) ? name : throw new ArgumentNullException(nameof(name));
    }


    public PaymentMethod VerifyOrAddPaymentMethod(
        int cardTypeId, string alias, string cardNumber,
        string securityNumber, string cardHolderName, DateTime expiration, int orderId)
    {
        var existingPayment = _paymentMethods
            .SingleOrDefault(p => p.IsEqualTo(cardTypeId, cardNumber, expiration));

        if (existingPayment != null)
        {
            AddDomainEvent(new BuyerPaymentMethodVerifiedDomainEvent(this, existingPayment, orderId));

            return existingPayment;
        }

        var payment = new PaymentMethod(cardTypeId, alias, cardNumber, securityNumber, cardHolderName, expiration);

        _paymentMethods.Add(payment);

        AddDomainEvent(new BuyerPaymentMethodVerifiedDomainEvent(this, payment, orderId));

        return payment;
    }
}
