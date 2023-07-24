using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Me.Services.Common;
internal class AuthorizeCheckOperationFilter : IOperationFilter
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthorizeCheckOperationFilter> _logger;


    public AuthorizeCheckOperationFilter(IConfiguration configuration, IServiceProvider sp)
    {
        _configuration = configuration;
        _logger = sp.GetRequiredService<ILogger<AuthorizeCheckOperationFilter>>();
    }


    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check for authorize attribute
        var hasAuthorize = false;

        if (context.MethodInfo.DeclaringType is not null)
        {
            hasAuthorize = context.MethodInfo.DeclaringType.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() ||
                               context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any();
        }

        if (!hasAuthorize) return;

        operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
        operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Forbidden" });

        var oAuthScheme = new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
        };

        var identitySection = _configuration.GetSection("Identity");
        var scopes = identitySection.GetRequiredSection("Scopes").GetChildren().Select(r => r.Key).ToArray();

        operation.Security = new List<OpenApiSecurityRequirement>
            {
                new()
                {
                    [ oAuthScheme ] = scopes
                }
            };
    }
}
