var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddMvc().AddNewtonsoftJson();

// Using environment secrets
Console.WriteLine($"--> Stripe config loaded: {string.IsNullOrWhiteSpace(StripeConfiguration.ApiKey)}");
StripeConfiguration.ApiKey = builder.Configuration["stripe-configuration-apikey"];

var app = builder.Build();

app.UseRouting();

app.UseAuthorization();

app.UseEndpoints(endpoints => endpoints.MapControllers());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();


app.MapControllers();

app.Run();
