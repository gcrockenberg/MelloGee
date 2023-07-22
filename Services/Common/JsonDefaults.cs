using System.Text.Json;

namespace Me.Services.Common;

public static class JsonDefaults
{
    public static readonly JsonSerializerOptions CaseInsensitiveOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };
}