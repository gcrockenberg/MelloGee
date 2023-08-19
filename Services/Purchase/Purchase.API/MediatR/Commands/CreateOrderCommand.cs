namespace Me.Services.Purchase.API.MediatR.Commands;

// DDD and CQRS patterns comment: Note that it is recommended to implement immutable Commands
// In this case, its immutability is achieved by having all the setters as private
// plus only being able to update the data just once, when creating the object through its constructor.
// References on Immutable Commands:  
// http://cqrs.nu/Faq
// https://docs.spine3.org/motivation/immutability.html 
// http://blog.gauffin.org/2012/06/griffin-container-introducing-command-support/
// https://docs.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/how-to-implement-a-lightweight-class-with-auto-implemented-properties


[DataContract]
public class CreateOrderCommand
    : IRequest<Order>
{
    [DataMember]
    private readonly List<OrderItemDTO> _orderItems;

    [DataMember]
    public string UserId { get; private set; } = string.Empty;

    [DataMember]
    public string UserName { get; private set; } = string.Empty;

    [DataMember]
    public string City { get; private set; } = string.Empty;

    [DataMember]
    public string Street { get; private set; } = string.Empty;

    [DataMember]
    public string State { get; private set; } = string.Empty;

    [DataMember]
    public string Country { get; private set; } = string.Empty;

    [DataMember]
    public string ZipCode { get; private set; } = string.Empty;

    [DataMember]
    public string CardNumber { get; private set; } = string.Empty;

    [DataMember]
    public string CardHolderName { get; private set; } = string.Empty;

    [DataMember]
    public DateTime CardExpiration { get; private set; }

    [DataMember]
    public string CardSecurityNumber { get; private set; } = string.Empty;

    [DataMember]
    public int CardTypeId { get; private set; }

    [DataMember]
    public IEnumerable<OrderItemDTO> OrderItems => _orderItems;

    [DataMember]
    public string SourceCartSessionId { get; set; } = string.Empty;

    [DataMember]
    public string StripeMode { get; private set; } = string.Empty;

    [DataMember]
    public string RedirectUrl { get; private set; } = string.Empty;

    [DataMember]
    public string ClientSecret { get; private set; } = string.Empty;


    public CreateOrderCommand()
    {
        _orderItems = new List<OrderItemDTO>();
    }

    public CreateOrderCommand(List<CartItem> cartItems, string userId, string userName, string city, string street, string state, string country, string zipcode,
        string cardNumber, string cardHolderName, DateTime cardExpiration,
        string cardSecurityNumber, int cardTypeId, string sourceCartSessionId) : this()
    {
        _orderItems = cartItems.ToOrderItemsDTO().ToList();
        UserId = userId;
        UserName = userName;
        City = city;
        Street = street;
        State = state;
        Country = country;
        ZipCode = zipcode;
        CardNumber = string.IsNullOrWhiteSpace(cardNumber) ? "stripe" : cardNumber;
        CardHolderName = string.IsNullOrWhiteSpace(cardHolderName) ? "stripe" : cardHolderName;
        CardExpiration = cardExpiration;
        CardSecurityNumber =  string.IsNullOrWhiteSpace(cardSecurityNumber) ? "stripe" : cardSecurityNumber;
        CardTypeId = cardTypeId;
        SourceCartSessionId = sourceCartSessionId;
    }
}

