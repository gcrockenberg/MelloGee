FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

ENV ASPNETCORE_URLS=http://+:80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["Services/CatalogService/CatalogService.csproj", "Services/CatalogService/"]
RUN dotnet restore "Services/CatalogService/CatalogService.csproj"
COPY . .
WORKDIR "/src/Services/CatalogService"
RUN dotnet build "CatalogService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CatalogService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build src/Services/CatalogService/CatalogService.pfx .
ENTRYPOINT ["dotnet", "CatalogService.dll"]
