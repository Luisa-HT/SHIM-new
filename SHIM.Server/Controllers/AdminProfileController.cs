// YourAspNetCoreProject/Controllers/AdminProfileController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Security.Claims;
using System.Threading.Tasks;
using SHIM.Server.Models.DTOs; // Ensure this namespace matches your DTOs file
using SHIM.Server.Services.Interfaces; // For IConnectionService and ITokenService

namespace SHIM.Server.Controllers
{
    [ApiController]
    [Route("api/admin")] // Distinct route from /api/users
    [Authorize(Roles = "Admin")] // Only administrators can access these endpoints
    public class AdminProfileController : ControllerBase
    {
        private readonly ILogger<AdminProfileController> _logger;
        private readonly IConnectionService _connectionService;
        private readonly ITokenService _tokenService; // Required for email update that might require token re-issue

        public AdminProfileController(ILogger<AdminProfileController> logger, IConnectionService connectionService, ITokenService tokenService)
        {
            _logger = logger;
            _connectionService = connectionService;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Helper method to get the current admin's ID from the JWT token.
        /// </summary>
        /// <returns>The admin ID as a string, or null/empty if not found.</returns>
        private string GetCurrentAdminId() => User.FindFirstValue(ClaimTypes.NameIdentifier);


        /// <summary>
        /// Retrieves the profile of the currently authenticated administrator.
        /// </summary>
        /// <returns>The admin's profile data.</returns>
        [HttpGet("profile")]
        public async Task<IActionResult> GetAdminProfile()
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId))
            {
                _logger.LogWarning("Unauthorized attempt to get admin profile: Admin ID not found in token.");
                return Unauthorized(new { message = "Admin ID not found in token." });
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: SELECT statement for admin table - only schema-defined columns
                cmd.CommandText = "SELECT id_Admin, Nama_Admin, Email, No_Telp FROM admin WHERE id_Admin = @CurrentAdminId;";
                var idParam = cmd.CreateParameter();
                idParam.ParameterName = "@CurrentAdminId";
                idParam.Value = Convert.ToInt32(currentAdminId);
                cmd.Parameters.Add(idParam);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var adminProfile = new AdminProfileDto
                    {
                        id_Admin = reader.GetInt32(reader.GetOrdinal("id_Admin")),
                        Nama_Admin = reader["Nama_Admin"].ToString(),
                        Email = reader["Email"].ToString(),
                        No_Telp = reader.IsDBNull(reader.GetOrdinal("No_Telp")) ? null : reader["No_Telp"].ToString()
                        // Re-check: Status, Institute, Studies are NOT included as they are not in the admin table schema
                    };
                    return Ok(adminProfile);
                }
                return NotFound(new { message = "Admin profile not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admin profile for admin ID: {AdminId}", currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while fetching admin profile." });
            }
        }

        /// <summary>
        /// Updates the profile of the currently authenticated administrator.
        /// </summary>
        /// <param name="profileDto">The DTO containing updated profile information.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateAdminProfile([FromBody] UpdateAdminProfileDto profileDto)
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId))
            {
                _logger.LogWarning("Unauthorized attempt to update admin profile: Admin ID not found in token.");
                return Unauthorized(new { message = "Admin ID not found in token." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors from DTO attributes
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: UPDATE statement for admin table - only schema-defined columns
                cmd.CommandText = "UPDATE admin SET Nama_Admin = @Nama_Admin, No_Telp = @No_Telp WHERE id_Admin = @CurrentAdminId;";

                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Admin"; namaParam.Value = profileDto.Nama_Admin; cmd.Parameters.Add(namaParam);
                var noTelpParam = cmd.CreateParameter(); noTelpParam.ParameterName = "@No_Telp"; noTelpParam.Value = (object)profileDto.No_Telp ?? DBNull.Value; cmd.Parameters.Add(noTelpParam);
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@CurrentAdminId"; idParam.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(idParam);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = "Admin profile not found or no changes made." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admin profile for admin ID: {AdminId}", currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while updating admin profile." });
            }
        }

        /// <summary>
        /// Updates the email address of the currently authenticated administrator.
        /// </summary>
        /// <param name="emailDto">The DTO containing the new email address.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("profile/email")]
        public async Task<IActionResult> UpdateAdminEmail([FromBody] UpdateEmailDto emailDto)
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId))
            {
                _logger.LogWarning("Unauthorized attempt to update admin email: Admin ID not found in token.");
                return Unauthorized(new { message = "Admin ID not found in token." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors from DTO attributes
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Check if new email is already taken by another admin - only Email and id_Admin
                cmd.CommandText = "SELECT COUNT(*) FROM admin WHERE Email = @NewEmail AND id_Admin <> @CurrentAdminId;";
                var emailParamCheck = cmd.CreateParameter(); emailParamCheck.ParameterName = "@NewEmail"; emailParamCheck.Value = emailDto.NewEmail; cmd.Parameters.Add(emailParamCheck);
                var idParamCheck = cmd.CreateParameter(); idParamCheck.ParameterName = "@CurrentAdminId"; idParamCheck.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(idParamCheck);
                long emailExists = (long)await cmd.ExecuteScalarAsync();
                if (emailExists > 0)
                {
                    return Conflict(new { message = "New email address is already in use by another admin account." });
                }
                cmd.Parameters.Clear();

                // Re-check: UPDATE statement for Email - only Email and id_Admin
                cmd.CommandText = "UPDATE admin SET Email = @NewEmail WHERE id_Admin = @CurrentAdminId;";
                var emailParamUpdate = cmd.CreateParameter(); emailParamUpdate.ParameterName = "@NewEmail"; emailParamUpdate.Value = emailDto.NewEmail; cmd.Parameters.Add(emailParamUpdate);
                var idParamUpdate = cmd.CreateParameter(); idParamUpdate.ParameterName = "@CurrentAdminId"; idParamUpdate.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(idParamUpdate);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = "Admin profile not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admin email for admin ID: {AdminId}", currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while updating admin email." });
            }
        }

        /// <summary>
        /// Updates the password of the currently authenticated administrator.
        /// </summary>
        /// <param name="passwordDto">The DTO containing current and new passwords.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("profile/password")]
        public async Task<IActionResult> UpdateAdminPassword([FromBody] UpdatePasswordDto passwordDto)
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId))
            {
                _logger.LogWarning("Unauthorized attempt to update admin password: Admin ID not found in token.");
                return Unauthorized(new { message = "Admin ID not found in token." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors from DTO attributes
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: SELECT statement for Password verification - only Password and id_Admin
                cmd.CommandText = "SELECT Password FROM admin WHERE id_Admin = @CurrentAdminId;";
                var idParamVerify = cmd.CreateParameter(); idParamVerify.ParameterName = "@CurrentAdminId"; idParamVerify.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(idParamVerify);

                var storedPasswordHash = await cmd.ExecuteScalarAsync() as string;
                if (storedPasswordHash == null) return NotFound(new { message = "Admin not found." });

                if (!SecurePasswordHasher.Verify(passwordDto.CurrentPassword, storedPasswordHash))
                {
                    return BadRequest(new { message = "Incorrect current password." });
                }
                cmd.Parameters.Clear();

                // Re-check: UPDATE statement for Password - only Password and id_Admin
                string newHashedPassword = SecurePasswordHasher.Hash(passwordDto.NewPassword); // Uses INSECURE placeholder

                cmd.CommandText = "UPDATE admin SET Password = @NewHashedPassword WHERE id_Admin = @CurrentAdminId;";
                var newPassParam = cmd.CreateParameter(); newPassParam.ParameterName = "@NewHashedPassword"; newPassParam.Value = newHashedPassword; cmd.Parameters.Add(newPassParam);
                var idParamUpdate = cmd.CreateParameter(); idParamUpdate.ParameterName = "@CurrentAdminId"; idParamUpdate.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(idParamUpdate);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : StatusCode(500, new { message = "Failed to update password." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admin password for admin ID: {AdminId}", currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while updating admin password." });
            }
        }
    }
}
