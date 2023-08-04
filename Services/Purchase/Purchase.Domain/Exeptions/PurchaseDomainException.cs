namespace Me.Services.Purchase.Domain.Exceptions;

/// <summary>
/// Exception type for domain exceptions
/// </summary>
public class PurchaseDomainException : Exception
{
    public PurchaseDomainException()
    { }

    public PurchaseDomainException(string message)
        : base(message)
    { }

    public PurchaseDomainException(string message, Exception innerException)
        : base(message, innerException)
    { }
}