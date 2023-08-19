namespace Me.Services.Purchase.Domain;

/// <summary>
/// For labelling and passing metadata
/// </summary>
public static class Constants {
    public const string ORDER_NUMBER_TAG = "ORDER_NUMBER";
    public const string STRIPE_MODE_INTENT = "intent";
    public const string STRIPE_MODE_REDIRECT = "redirect";
    
    public static bool IsStripeMode(string stripeMode)
    {
        return stripeMode.Equals(STRIPE_MODE_INTENT, StringComparison.OrdinalIgnoreCase)
          || stripeMode.Equals(STRIPE_MODE_REDIRECT, StringComparison.OrdinalIgnoreCase);
    }
}