// YourAspNetCoreProject/Services/Implementations/JwtTokenService.cs
using SHIM.Server.Services.Interfaces;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens; // Required for SymmetricSecurityKey

namespace SHIM.Server.Services.Implementations;
    public class JwtTokenService : ITokenService
    {
        // IMPORTANT: In a real application, the secret key should be loaded from
        // a secure configuration source (e.g., environment variables, Azure Key Vault)
        // and NOT hardcoded or stored directly in source control.
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;

        public JwtTokenService(string secretKey, string issuer, string audience)
        {
            _secretKey = secretKey;
            _issuer = issuer;
            _audience = audience;
        }

        /// <summary>
        /// Generates a dummy JWT token.
        /// CRITICAL: In a real application, this method would create a cryptographically
        /// signed JWT with proper claims, expiration, and signing credentials.
        /// </summary>
        /// <param name="userId">The user's unique ID.</param>
        /// <param name="name">The user's name.</param>
        /// <param name="email">The user's email.</param>
        /// <param name="role">The user's role.</param>
        /// <returns>A dummy JWT string.</returns>
        public string GenerateToken(string userId, string name, string email, string role)
        {
            // Placeholder: This generates a simple, unsigned token string.
            // For a real JWT, you would use JwtSecurityTokenHandler.
            // Example of real JWT generation (requires proper setup in Program.cs/Startup.cs):
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(7); // Token valid for 7 days

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }