namespace Me.Services.Purchase.API;

public class PurchaseSettings
{
    public bool UseCustomizationData { get; set; }

    public string ConnectionString { get; set; }

    public string EventBusConnection { get; set; }

    public int GracePeriodTime { get; set; }

    public int CheckUpdateTime { get; set; }
}