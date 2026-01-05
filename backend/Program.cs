using System.Reflection;
using Microsoft.EntityFrameworkCore;
using RailwayAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});

// Configure DbContext with SQL Server or InMemory for testing
// Connection string placeholder - update in appsettings.json
var connectionString = builder.Configuration.GetConnectionString("RailwayDatabase");
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("YOUR_SERVER_NAME"))
{
    // Use InMemory database for testing when SQL Server is not configured
    builder.Services.AddDbContext<RailwayDbContext>(options =>
        options.UseInMemoryDatabase("RailwayDB"));
}
else
{
    builder.Services.AddDbContext<RailwayDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// Add CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RailwayDbContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Commented out for HTTP-only development

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
