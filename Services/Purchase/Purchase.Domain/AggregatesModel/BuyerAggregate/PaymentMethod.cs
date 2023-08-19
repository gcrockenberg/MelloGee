namespace Me.Services.Purchase.Domain.AggregatesModel.BuyerAggregate;

public class PaymentMethod : Entity
{
    private string _alias = string.Empty;
    private string _cardNumber = string.Empty;
    private string _securityNumber = string.Empty;
    private string _cardHolderName = string.Empty;
    private DateTime _expiration;

    private int _cardTypeId;
    public CardType CardType { get; private set; }

    public virtual ICollection<Order> Orders { get; } = new List<Order>();

    protected PaymentMethod() { }

    // Validation removed resulting from switch to Stripe
    public PaymentMethod(int cardTypeId, string alias, string cardNumber, string securityNumber, string cardHolderName, DateTime expiration)
    {
        _cardNumber = cardNumber;           // throw new PurchaseDomainException(nameof(cardNumber));
        _securityNumber = securityNumber;   // throw new PurchaseDomainException(nameof(securityNumber));
        _cardHolderName = cardHolderName;   // throw new PurchaseDomainException(nameof(cardHolderName));

        // if (expiration < DateTime.UtcNow)
        // {
        //     throw new PurchaseDomainException(nameof(expiration));
        // }

        _alias = alias;
        _expiration = expiration;
        _cardTypeId = cardTypeId;
    }

    public bool IsEqualTo(int cardTypeId, string cardNumber, DateTime expiration)
    {
        return _cardTypeId == cardTypeId
            && _cardNumber == cardNumber
            && _expiration == expiration;
    }
}
