namespace Me.Services.Catalog.API;

public class CatalogSettings
{
    public string PicBaseUrl { get; set; } = string.Empty;

    public string EventBusConnection { get; set; } = string.Empty;

    public bool UseCustomizationData { get; set; }

    public bool AzureStorageEnabled { get; set; }
}