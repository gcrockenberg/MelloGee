FROM mcr.microsoft.com/dotnet/aspnet:8.0.0-preview.7 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0.100-preview.7 AS build
WORKDIR /src

# It's important to keep lines from here down to "COPY . ." identical in all Dockerfiles
# to take advantage of Docker's build cache, to speed up local container builds
COPY "MeServices.sln" "MeServices.sln"

COPY "Services/Common/Common.csproj" "Services/Common/Common.csproj"
COPY "Services/EventBus/EventBus/EventBus.csproj" "Services/EventBus/EventBus/EventBus.csproj"
COPY "Services/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj" "Services/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj"
COPY "Services/EventBus/EventBusServiceBus/EventBusServiceBus.csproj" "Services/EventBus/EventBusServiceBus/EventBusServiceBus.csproj"
COPY "Services/EventBus/EventBusServiceBus/EventBusServiceBus.csproj" "Services/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj"
COPY "Services/Catalog/Catalog.API/Catalog.API.csproj" "Services/Catalog/Catalog.API/Catalog.API.csproj"
COPY "Services/Cart/Cart.API/Cart.API.csproj" "Services/Cart/Cart.API/Cart.API.csproj"
COPY "Services/Purchase/Purchase.Domain/Purchase.Domain.csproj" "Services/Purchase/Purchase.Domain/Purchase.Domain.csproj"
COPY "Services/Purchase/Purchase.Infrastructure/Purchase.Infrastructure.csproj" "Services/Purchase/Purchase.Infrastructure/Purchase.Infrastructure.csproj"
COPY "Services/Purchase/Purchase.API/Purchase.API.csproj" "Services/Purchase/Purchase.API/Purchase.API.csproj"
COPY "Services/SignalRHub/SignalRHub.csproj" "Services/SignalRHub/SignalRHub.csproj"
COPY "Directory.Packages.props" "Directory.Packages.props"

RUN dotnet restore "MeServices.sln"

COPY . .
WORKDIR /src/Services/SignalRHub
RUN dotnet publish -c Release -o /app
FROM build AS publish

FROM base AS final
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "SignalRHub.dll"]