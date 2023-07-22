namespace Me.Services.Cart.API.Model;

public class CartItem : IValidatableObject
{
    public string Id { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal OldUnitPrice { get; set; }
    public int Quantity { get; set; }
    public string PictureUrl { get; set; } = string.Empty;


    static readonly string[] MEMBER_NAMES = { "Quantity" };
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {        
        var results = new List<ValidationResult>();

        if (Quantity < 1)
        {
            results.Add(new ValidationResult("Invalid number of units", MEMBER_NAMES));
        }

        return results;
    }
}