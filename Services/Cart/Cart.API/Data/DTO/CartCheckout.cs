namespace Me.Services.Cart.API.DTO;

public class CartCheckout
{
    public string City { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public string ZipCode { get; set; } = string.Empty;

    public string CardNumber { get; set; } = string.Empty;

    public string CardHolderName { get; set; } = string.Empty;

    public DateTime CardExpiration { get; set; }

    public string CardSecurityNumber { get; set; } = string.Empty;

    public int CardTypeId { get; set; }

    public string Buyer { get; set; } = string.Empty;

    public Guid RequestId { get; set; }
}
