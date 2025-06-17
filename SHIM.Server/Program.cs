// Assuming you have a standard Program.cs setup in your ASP.NET Core project.
// You will need to add the following 'using' statements at the top of your Program.cs file:
using SHIM.Server.Services.Interfaces;
using SHIM.Server.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer; // For JWT authentication setup
using Microsoft.IdentityModel.Tokens; // For SymmetricSecurityKey
using System.Text; // For Encoding
using Microsoft.AspNetCore.Authorization; // For authorization policies (if needed beyond roles)


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 1. Add your consolidated DTOs namespace (if not already implicitly included)
// This is not a service registration, but ensures DTOs are recognized.
// using SHIM.Server.Models.DTOs; // Add this if you haven't already

// 2. Register your custom services for Dependency Injection
// Register IConnectionService
builder.Services.AddScoped<IConnectionService, ConnectionService>();

// Register ITokenService
builder.Services.AddSingleton<ITokenService, JwtTokenService>(provider =>
{
    // Load JWT settings from appsettings.json
    // Add a "JwtSettings" section to appsettings.json:
    /*
    "JwtSettings": {
        "Secret": "YOUR_SUPER_SECRET_JWT_KEY_MIN_16_CHARS", // MUST be a strong, long, random key
        "Issuer": "SHIM.Server",
        "Audience": "SHIM.Client"
    }
    */
    var jwtSecret = builder.Configuration["JwtSettings:Secret"];
    var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
    var jwtAudience = builder.Configuration["JwtSettings:Audience"];

    if (string.IsNullOrEmpty(jwtSecret) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
    {
        throw new InvalidOperationException("JWT settings (Secret, Issuer, Audience) are not configured in appsettings.json.");
    }

    return new JwtTokenService(jwtSecret, jwtIssuer, jwtAudience);
});


builder.Services.AddControllersWithViews(); // Or AddControllers() if it's an API-only project

// 3. Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    // Load the same secret key used for token generation
    var jwtSecret = builder.Configuration["JwtSettings:Secret"];
    if (string.IsNullOrEmpty(jwtSecret))
    {
        throw new InvalidOperationException("JWT Secret is missing in configuration for authentication.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

// 4. Add Authorization (if not already present)
builder.Services.AddAuthorization(options =>
{
    // You can define policies here if needed, beyond simple role checks
    // options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    // options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseStaticFiles();
app.UseRouting();

// 5. Add Authentication and Authorization middleware
app.UseAuthentication(); // MUST be before UseAuthorization
app.UseAuthorization();  // MUST be after UseAuthentication

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); // For React SPA routing

app.Run();