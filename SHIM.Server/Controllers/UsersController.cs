// YourAspNetCoreProject/Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Data.Common;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SHIM.Server.Models.DTOs; // Ensure this namespace matches your DTOs file
using SHIM.Server.Services.Interfaces; // For IConnectionService

namespace SHIM.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "User")] // Most actions here are for the authenticated User role
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IConnectionService _connectionService;

        public UsersController(ILogger<UsersController> logger, IConnectionService connectionService)
        {
            _logger = logger;
            _connectionService = connectionService;
        }

        /// <summary>
        /// Helper method to get the current user's ID from the JWT token.
        /// </summary>
        /// <returns>The user ID as a string, or null/empty if not found.</returns>
        private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        /// <summary>
        /// Retrieves the profile of the currently authenticated user.
        /// </summary>
        /// <returns>The user's profile data.</returns>
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("Unauthorized attempt to get user profile: User ID not found in token.");
                return Unauthorized(new { message = "User ID not found in token." });
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: SELECT statement for peminjam table - only schema-defined columns
                cmd.CommandText = "SELECT id_Peminjam, Nama_Peminjam, Email, No_Telp, Alamat FROM peminjam WHERE id_Peminjam = @CurrentUserId;";
                var idParam = cmd.CreateParameter();
                idParam.ParameterName = "@CurrentUserId";
                idParam.Value = Convert.ToInt32(currentUserId);
                cmd.Parameters.Add(idParam);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var userProfile = new UserProfileDto
                    {
                        id_Peminjam = reader.GetInt32(reader.GetOrdinal("id_Peminjam")),
                        Nama_Peminjam = reader["Nama_Peminjam"].ToString(),
                        Email = reader["Email"].ToString(),
                        No_Telp = reader.IsDBNull(reader.GetOrdinal("No_Telp")) ? null : reader["No_Telp"].ToString(),
                        Alamat = reader.IsDBNull(reader.GetOrdinal("Alamat")) ? null : reader["Alamat"].ToString()
                        // Re-check: Status, Institute, Studies are NOT included as they are not in the peminjam table schema
                    };
                    return Ok(userProfile);
                }
                return NotFound(new { message = "User profile not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user profile for user ID: {UserId}", currentUserId);
                return StatusCode(500, new { message = "An internal server error occurred while fetching user profile." });
            }
        }

        /// <summary>
        /// Updates the profile of the currently authenticated user.
        /// </summary>
        /// <param name="profileDto">The DTO containing updated profile information.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileDto profileDto)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("Unauthorized attempt to update user profile: User ID not found in token.");
                return Unauthorized(new { message = "User ID not found in token." });
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

                // Re-check: UPDATE statement for peminjam table - only schema-defined columns
                cmd.CommandText = "UPDATE peminjam SET Nama_Peminjam = @Nama_Peminjam, No_Telp = @No_Telp, Alamat = @Alamat WHERE id_Peminjam = @CurrentUserId;";

                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Peminjam"; namaParam.Value = profileDto.Nama_Peminjam; cmd.Parameters.Add(namaParam);
                var noTelpParam = cmd.CreateParameter(); noTelpParam.ParameterName = "@No_Telp"; noTelpParam.Value = (object)profileDto.No_Telp ?? DBNull.Value; cmd.Parameters.Add(noTelpParam);
                var alamatParam = cmd.CreateParameter(); alamatParam.ParameterName = "@Alamat"; alamatParam.Value = (object)profileDto.Alamat ?? DBNull.Value; cmd.Parameters.Add(alamatParam);
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@CurrentUserId"; idParam.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(idParam);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = "User profile not found or no changes made." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile for user ID: {UserId}", currentUserId);
                return StatusCode(500, new { message = "An internal server error occurred while updating user profile." });
            }
        }

        /// <summary>
        /// Updates the email address of the currently authenticated user.
        /// </summary>
        /// <param name="emailDto">The DTO containing the new email address.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("profile/email")]
        public async Task<IActionResult> UpdateUserEmail([FromBody] UpdateEmailDto emailDto)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("Unauthorized attempt to update user email: User ID not found in token.");
                return Unauthorized(new { message = "User ID not found in token." });
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

                // Re-check: Check if new email is already taken by another user - only Email and id_Peminjam
                cmd.CommandText = "SELECT COUNT(*) FROM peminjam WHERE Email = @NewEmail AND id_Peminjam <> @CurrentUserId;";
                var emailParamCheck = cmd.CreateParameter(); emailParamCheck.ParameterName = "@NewEmail"; emailParamCheck.Value = emailDto.NewEmail; cmd.Parameters.Add(emailParamCheck);
                var idParamCheck = cmd.CreateParameter(); idParamCheck.ParameterName = "@CurrentUserId"; idParamCheck.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(idParamCheck);
                long emailExists = (long)await cmd.ExecuteScalarAsync();
                if (emailExists > 0)
                {
                    return Conflict(new { message = "New email address is already in use by another account." });
                }
                cmd.Parameters.Clear();

                // Re-check: UPDATE statement for Email - only Email and id_Peminjam
                cmd.CommandText = "UPDATE peminjam SET Email = @NewEmail WHERE id_Peminjam = @CurrentUserId;";
                var emailParamUpdate = cmd.CreateParameter(); emailParamUpdate.ParameterName = "@NewEmail"; emailParamUpdate.Value = emailDto.NewEmail; cmd.Parameters.Add(emailParamUpdate);
                var idParamUpdate = cmd.CreateParameter(); idParamUpdate.ParameterName = "@CurrentUserId"; idParamUpdate.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(idParamUpdate);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = "User profile not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user email for user ID: {UserId}", currentUserId);
                return StatusCode(500, new { message = "An internal server error occurred while updating user email." });
            }
        }

        /// <summary>
        /// Updates the password of the currently authenticated user.
        /// </summary>
        /// <param name="passwordDto">The DTO containing current and new passwords.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("profile/password")]
        public async Task<IActionResult> UpdateUserPassword([FromBody] UpdatePasswordDto passwordDto)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("Unauthorized attempt to update user password: User ID not found in token.");
                return Unauthorized(new { message = "User ID not found in token." });
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

                // Re-check: SELECT statement for Password verification - only Password and id_Peminjam
                cmd.CommandText = "SELECT Password FROM peminjam WHERE id_Peminjam = @CurrentUserId;";
                var idParamVerify = cmd.CreateParameter(); idParamVerify.ParameterName = "@CurrentUserId"; idParamVerify.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(idParamVerify);

                var storedPasswordHash = await cmd.ExecuteScalarAsync() as string;
                if (storedPasswordHash == null) return NotFound(new { message = "User not found." });

                if (!SecurePasswordHasher.Verify(passwordDto.CurrentPassword, storedPasswordHash))
                {
                    return BadRequest(new { message = "Incorrect current password." });
                }
                cmd.Parameters.Clear();

                // Re-check: UPDATE statement for Password - only Password and id_Peminjam
                string newHashedPassword = SecurePasswordHasher.Hash(passwordDto.NewPassword); // Uses INSECURE placeholder

                cmd.CommandText = "UPDATE peminjam SET Password = @NewHashedPassword WHERE id_Peminjam = @CurrentUserId;";
                var newPassParam = cmd.CreateParameter(); newPassParam.ParameterName = "@NewHashedPassword"; newPassParam.Value = newHashedPassword; cmd.Parameters.Add(newPassParam);
                var idParamUpdate = cmd.CreateParameter(); idParamUpdate.ParameterName = "@CurrentUserId"; idParamUpdate.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(idParamUpdate);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : StatusCode(500, new { message = "Failed to update password." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user password for user ID: {UserId}", currentUserId);
                return StatusCode(500, new { message = "An internal server error occurred while updating user password." });
            }
        }
    }
}
