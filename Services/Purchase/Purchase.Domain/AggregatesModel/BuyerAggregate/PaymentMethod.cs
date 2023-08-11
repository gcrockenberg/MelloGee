namespace Me.Services.Purchase.Domain.AggregatesModel.BuyerAggregate;

public class PaymentMethod : Entity
{
    private string _alias;
    private string _cardNumber;
    private string _securityNumber;
    private string _cardHolderName;
    private DateTime _expiration;

    private int _cardTypeId;
    public CardType CardType { get; private set; }

    protected PaymentMethod() { }

    public PaymentMethod(int cardTypeId, string alias, string cardNumber, string securityNumber, string cardHolderName, DateTime expiration)
    {
        _cardNumber = !string.IsNullOrWhiteSpace(cardNumber) ? cardNumber : "stripe";               // throw new PurchaseDomainException(nameof(cardNumber));
        _securityNumber = !string.IsNullOrWhiteSpace(securityNumber) ? securityNumber : "stripe";   // throw new PurchaseDomainException(nameof(securityNumber));
        _cardHolderName = !string.IsNullOrWhiteSpace(cardHolderName) ? cardHolderName : "stripe";   // throw new PurchaseDomainException(nameof(cardHolderName));

        // Stripe
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
