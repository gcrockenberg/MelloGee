var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger is used by APIM to import operations using OpenAPI
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

// If enabled then specify ASPNETCORE_HTTPS_PORT: port# in Docker environment
// Not needed behind APIM Gateway
//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
