FROM mcr.microsoft.com/dotnet/aspnet:8.0.0-preview.6 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Specified here for consistency - local and Azure Container App
ENV Kestrel__Endpoints__HTTP__Url=http://+:80
ENV Kestrel__Endpoints__GRPC__Url=http://+:81
ENV Kestrel__Endpoints__GRPC__Protocols=Http2

FROM mcr.microsoft.com/dotnet/sdk:8.0.100-preview.6 AS build
WORKDIR /src

# It's important to keep lines from here down to "COPY . ." identical in all Dockerfiles
# to take advantage of Docker's build cache, to speed up local container builds
COPY "MeServices.sln" "MeServices.sln"

COPY "Services/Common/Common.csproj" "Services/Common/Common.csproj"
COPY "Services/EventBus/EventBus/EventBus.csproj" "Services/EventBus/EventBus/EventBus.csproj"
COPY "Services/EventBus/EventBusServiceBus/EventBusServiceBus.csproj" "Services/EventBus/EventBusServiceBus/EventBusServiceBus.csproj"
COPY "Services/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj" "Services/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj"
COPY "Services/Catalog/Catalog.API/Catalog.API.csproj" "Services/Catalog/Catalog.API/Catalog.API.csproj"
COPY "Services/Cart/Cart.API/Cart.API.csproj" "Services/Cart/Cart.API/Cart.API.csproj"
COPY "Directory.Packages.props" "Directory.Packages.props"
COPY "NuGet.config" "NuGet.config"

RUN dotnet restore "MeServices.sln"

COPY . .
WORKDIR /src/Services/Cart/Cart.API
RUN dotnet publish --no-restore -c Release -o /app
FROM build AS publish

FROM base AS final
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Cart.API.dll"]