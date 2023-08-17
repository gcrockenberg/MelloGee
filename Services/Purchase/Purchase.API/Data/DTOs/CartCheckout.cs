namespace Me.Services.Purchase.API.Data.DTOs;

using System.ComponentModel.DataAnnotations;    // ValidationException conflict with FluentValidation in GlobalUsings

public static class CheckoutMode
{
    public static readonly string Redirect = "Redirect";
    public static readonly string Intent = "Intent";
}


public class CartCheckout
{
    [Required]
    public required string Mode { get; set; }

    public string CancelRoute { get; set; } = string.Empty;
    public string SuccessRoute { get; set; } = string.Empty;

    [Required]
    public required string CartSessionId { get; set; }

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
