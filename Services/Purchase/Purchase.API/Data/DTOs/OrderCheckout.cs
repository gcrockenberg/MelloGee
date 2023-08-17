namespace Me.Services.Purchase.API.Data.DTOs;

using System.ComponentModel.DataAnnotations;    // ValidationException conflict with FluentValidation in GlobalUsings

public class OrderCheckout
{
    [Required]
    public required int OrderId { get; set; }

    [Required]
    public required string Mode { get; set; }

    public string CancelRoute { get; set; } = string.Empty;
    public string SuccessRoute { get; set; } = string.Empty;
}
