FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

ENV ASPNETCORE_URLS=http://+:80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["Services/Coffee/Coffee.API/Coffee.API.csproj", "Services/Coffee/Coffee.API/"]
RUN dotnet restore "Services/Coffee/Coffee.API/Coffee.API.csproj"
COPY . .
WORKDIR "/src/Services/Coffee/Coffee.API"
RUN dotnet build "Coffee.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Coffee.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build src/Services/Coffee/Coffee.API/Coffee.API.pfx .
ENTRYPOINT ["dotnet", "Coffee.API.dll"]
