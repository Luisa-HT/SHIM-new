// YourAspNetCoreProject/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Threading.Tasks;
using SHIM.Server.Models.DTOs; // Ensure this namespace matches your DTOs file
using SHIM.Server.Services.Interfaces; // For IConnectionService and ITokenService
using System.Security.Claims; // Required for ClaimTypes
using Microsoft.AspNetCore.Authorization; // Required for [Authorize]

namespace SHIM.Server.Controllers
{
    // IMPORTANT: This is a placeholder for a real password hashing implementation.
    // In a production environment, use a strong library like BCrypt.Net.
    // For this demo, we use the provided insecure placeholder.
    public static class SecurePasswordHasher
    {
        public static string Hash(string password)
        {
            // INSECURE - REPLACE WITH BCrypt.Net.BCrypt.HashPassword(password);
            return "hashed_" + password; // EXTREMELY INSECURE - FOR DEMO STRUCTURE ONLY
        }
        public static bool Verify(string password, string hashedPassword)
        {
            // INSECURE - REPLACE WITH BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            return "hashed_" + password == hashedPassword; // EXTREMELY INSECURE - FOR DEMO STRUCTURE ONLY
        }
    }

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly IConnectionService _connectionService;
        private readonly ITokenService _tokenService; // Now using the ITokenService

        public AuthController(ILogger<AuthController> logger, IConnectionService connectionService, ITokenService tokenService)
        {
            _logger = logger;
            _connectionService = connectionService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors from DTO attributes
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                LoginResponseDto loginResponse = null;
                string storedPasswordHash = null;
                string userId = null;
                string name = null;
                string email = null;
                string role = null;

                // Re-check: SELECT statement for peminjam table - only schema-defined columns
                cmd.CommandText = "SELECT id_Peminjam, Nama_Peminjam, Email, Password FROM peminjam WHERE Email = @Email;";
                var emailParam = cmd.CreateParameter();
                emailParam.ParameterName = "@Email";
                emailParam.Value = loginRequest.Email;
                cmd.Parameters.Add(emailParam);

                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        storedPasswordHash = reader["Password"].ToString();
                        if (SecurePasswordHasher.Verify(loginRequest.Password, storedPasswordHash))
                        {
                            userId = reader["id_Peminjam"].ToString();
                            name = reader["Nama_Peminjam"].ToString();
                            email = reader["Email"].ToString();
                            role = "User"; // Hardcoded role for Peminjam
                        }
                    }
                }

                // Re-check: SELECT statement for admin table - only schema-defined columns
                if (userId == null)
                {
                    cmd.Parameters.Clear(); // Clear previous parameters
                    cmd.CommandText = "SELECT id_Admin, Nama_Admin, Email, Password FROM admin WHERE Email = @Email;";
                    var adminEmailParam = cmd.CreateParameter();
                    adminEmailParam.ParameterName = "@Email";
                    adminEmailParam.Value = loginRequest.Email;
                    cmd.Parameters.Add(adminEmailParam);

                    await using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            storedPasswordHash = reader["Password"].ToString();
                            if (SecurePasswordHasher.Verify(loginRequest.Password, storedPasswordHash))
                            {
                                userId = reader["id_Admin"].ToString();
                                name = reader["Nama_Admin"].ToString();
                                email = reader["Email"].ToString();
                                role = "Admin"; // Hardcoded role for Admin
                            }
                        }
                    }
                }

                if (userId != null)
                {
                    string token = _tokenService.GenerateToken(userId, name, email, role);
                    loginResponse = new LoginResponseDto
                    {
                        Token = token,
                        UserId = userId,
                        Name = name,
                        Email = email,
                        Role = role
                    };
                    return Ok(loginResponse);
                }

                return Unauthorized(new { message = "Invalid email or password." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", loginRequest.Email);
                return StatusCode(500, new { message = "An internal server error occurred during login." });
            }
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequestDto signUpRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors from DTO attributes
            }

            string hashedPassword = SecurePasswordHasher.Hash(signUpRequest.Password); // Uses INSECURE placeholder

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Check if email already exists - only Email column
                cmd.CommandText = "SELECT COUNT(*) FROM peminjam WHERE Email = @Email;";
                var emailParamCheck = cmd.CreateParameter();
                emailParamCheck.ParameterName = "@Email";
                emailParamCheck.Value = signUpRequest.Email;
                cmd.Parameters.Add(emailParamCheck);
                long emailExists = (long)await cmd.ExecuteScalarAsync();
                if (emailExists > 0)
                {
                    return Conflict(new { message = "Email address is already registered." });
                }
                cmd.Parameters.Clear();

                // Re-check: INSERT statement for peminjam table - only schema-defined columns
                cmd.CommandText = @"
                    INSERT INTO peminjam (Nama_Peminjam, Email, No_Telp, Alamat, Password)
                    VALUES (@Nama_Peminjam, @Email, @No_Telp, @Alamat, @HashedPassword);
                    SELECT LAST_INSERT_ID();";

                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Peminjam"; namaParam.Value = signUpRequest.Nama_Peminjam; cmd.Parameters.Add(namaParam);
                var emailParam = cmd.CreateParameter(); emailParam.ParameterName = "@Email"; emailParam.Value = signUpRequest.Email; cmd.Parameters.Add(emailParam);
                var noTelpParam = cmd.CreateParameter(); noTelpParam.ParameterName = "@No_Telp"; noTelpParam.Value = (object)signUpRequest.No_Telp ?? DBNull.Value; cmd.Parameters.Add(noTelpParam);
                var alamatParam = cmd.CreateParameter(); alamatParam.ParameterName = "@Alamat"; alamatParam.Value = (object)signUpRequest.Alamat ?? DBNull.Value; cmd.Parameters.Add(alamatParam);
                var passParam = cmd.CreateParameter(); passParam.ParameterName = "@HashedPassword"; passParam.Value = hashedPassword; cmd.Parameters.Add(passParam);

                var newUserId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                if (newUserId > 0)
                {
                    string token = _tokenService.GenerateToken(newUserId.ToString(), signUpRequest.Nama_Peminjam, signUpRequest.Email, "User");
                    var loginResponse = new LoginResponseDto
                    {
                        Token = token,
                        UserId = newUserId.ToString(),
                        Name = signUpRequest.Nama_Peminjam,
                        Email = signUpRequest.Email,
                        Role = "User"
                    };
                    return CreatedAtAction(
                        actionName: nameof(UsersController.GetUserProfile),
                        controllerName: "Users",
                        routeValues: null,
                        value: loginResponse
                    );
                }
                return BadRequest(new { message = "User registration failed." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during signup for email: {Email}", signUpRequest.Email);
                return StatusCode(500, new { message = "An internal server error occurred during signup." });
            }
        }
    }
}
