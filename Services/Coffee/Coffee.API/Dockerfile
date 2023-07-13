FROM mcr.microsoft.com/dotnet/aspnet:8.0.0-preview.6 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

ENV ASPNETCORE_URLS=http://+:80

FROM mcr.microsoft.com/dotnet/sdk:8.0.100-preview.6 AS build
WORKDIR /src
COPY ["Services/Coffee/Coffee.API/Coffee.API.csproj", "Services/Coffee/Coffee.API/"]
COPY "Directory.Packages.props" "Directory.Packages.props"
COPY "NuGet.config" "NuGet.config"
RUN dotnet restore "Services/Coffee/Coffee.API/Coffee.API.csproj"
COPY . .
WORKDIR "/src/Services/Coffee/Coffee.API"
RUN dotnet publish --no-restore -c Release -o /app

FROM build AS publish

FROM base AS final
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY --from=publish /app .
COPY --from=build src/Services/Coffee/Coffee.API/Coffee.API.pfx .
ENTRYPOINT ["dotnet", "Coffee.API.dll"]
