// YourAspNetCoreProject/Controllers/GrantsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using SHIM.Server.Models.DTOs; // Ensure this namespace matches your DTOs file
using SHIM.Server.Services.Interfaces; // For IConnectionService
// For DbException specific error codes, you might need:

namespace SHIM.Server.Controllers
{
    [ApiController]
    [Route("api/grants")]
    [Authorize(Roles = "Admin")] // Grant management is typically an admin-only function
    public class GrantsController : ControllerBase
    {
        private readonly ILogger<GrantsController> _logger;
        private readonly IConnectionService _connectionService;

        public GrantsController(ILogger<GrantsController> logger, IConnectionService connectionService)
        {
            _logger = logger;
            _connectionService = connectionService;
        }

        /// <summary>
        /// Retrieves a paginated list of all grants.
        /// </summary>
        /// <param name="paginationParams">Pagination parameters.</param>
        /// <returns>A paginated list of grants.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllGrants([FromQuery] PaginationParams paginationParams)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                int offset = (paginationParams.PageNumber - 1) * paginationParams.PageSize;

                // Re-check: COUNT(*) query
                cmd.CommandText = "SELECT COUNT(*) FROM hibah;";
                long totalRecords = (long)await cmd.ExecuteScalarAsync();
                cmd.Parameters.Clear();

                // Re-check: SELECT for paged grants - only schema-defined columns from hibah
                cmd.CommandText = @"
                    SELECT id_Hibah, Nama_Hibah, Keterangan, Tahun, Penanggung_Jawab
                    FROM hibah
                    ORDER BY Nama_Hibah ASC
                    LIMIT @PageSize OFFSET @Offset;";

                var pageSizeParam = cmd.CreateParameter(); pageSizeParam.ParameterName = "@PageSize"; pageSizeParam.Value = paginationParams.PageSize; cmd.Parameters.Add(pageSizeParam);
                var offsetParam = cmd.CreateParameter(); offsetParam.ParameterName = "@Offset"; offsetParam.Value = offset; cmd.Parameters.Add(offsetParam);

                var grants = new List<HibahDto>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    grants.Add(new HibahDto
                    {
                        id_Hibah = reader.GetInt32(reader.GetOrdinal("id_Hibah")),
                        Nama_Hibah = reader.GetString(reader.GetOrdinal("Nama_Hibah")),
                        Keterangan = reader.IsDBNull(reader.GetOrdinal("Keterangan")) ? null : reader.GetString(reader.GetOrdinal("Keterangan")),
                        Tahun = reader.IsDBNull(reader.GetOrdinal("Tahun")) ? (short?)null : reader.GetInt16(reader.GetOrdinal("Tahun")),
                        Penanggung_Jawab = reader.IsDBNull(reader.GetOrdinal("Penanggung_Jawab")) ? null : reader.GetString(reader.GetOrdinal("Penanggung_Jawab"))
                    });
                }
                var paginatedResponse = new PaginatedResponse<HibahDto>(grants, paginationParams.PageNumber, paginationParams.PageSize, totalRecords);
                return Ok(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all grants.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching grants." });
            }
        }

        /// <summary>
        /// Retrieves details for a specific grant by ID.
        /// </summary>
        /// <param name="id">The ID of the grant.</param>
        /// <returns>The grant details.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGrantById(int id)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: SELECT statement for single grant - only schema-defined columns from hibah
                cmd.CommandText = @"
                    SELECT id_Hibah, Nama_Hibah, Keterangan, Tahun, Penanggung_Jawab
                    FROM hibah
                    WHERE id_Hibah = @id_Hibah;";
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Hibah"; idParam.Value = id; cmd.Parameters.Add(idParam);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var grant = new HibahDto
                    {
                        id_Hibah = reader.GetInt32(reader.GetOrdinal("id_Hibah")),
                        Nama_Hibah = reader.GetString(reader.GetOrdinal("Nama_Hibah")),
                        Keterangan = reader.IsDBNull(reader.GetOrdinal("Keterangan")) ? null : reader.GetString(reader.GetOrdinal("Keterangan")),
                        Tahun = reader.IsDBNull(reader.GetOrdinal("Tahun")) ? (short?)null : reader.GetInt16(reader.GetOrdinal("Tahun")),
                        Penanggung_Jawab = reader.IsDBNull(reader.GetOrdinal("Penanggung_Jawab")) ? null : reader.GetString(reader.GetOrdinal("Penanggung_Jawab"))
                    };
                    return Ok(grant);
                }
                return NotFound(new { message = $"Grant with ID {id} not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching grant with ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching grant details." });
            }
        }

        /// <summary>
        /// Creates a new grant.
        /// </summary>
        /// <param name="createDto">The DTO containing grant details.</param>
        /// <returns>201 Created with the new grant, or error.</returns>
        [HttpPost]
        public async Task<IActionResult> CreateGrant([FromBody] CreateHibahDto createDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: INSERT statement for hibah table - only schema-defined columns
                cmd.CommandText = @"
                    INSERT INTO hibah
                        (Nama_Hibah, Keterangan, Tahun, Penanggung_Jawab)
                    VALUES
                        (@Nama_Hibah, @Keterangan, @Tahun, @Penanggung_Jawab);
                    SELECT LAST_INSERT_ID();";

                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Hibah"; namaParam.Value = createDto.Nama_Hibah; cmd.Parameters.Add(namaParam);
                var keteranganParam = cmd.CreateParameter(); keteranganParam.ParameterName = "@Keterangan"; keteranganParam.Value = (object)createDto.Keterangan ?? DBNull.Value; cmd.Parameters.Add(keteranganParam);
                var tahunParam = cmd.CreateParameter(); tahunParam.ParameterName = "@Tahun"; tahunParam.Value = (object)createDto.Tahun ?? DBNull.Value; cmd.Parameters.Add(tahunParam);
                var pjParam = cmd.CreateParameter(); pjParam.ParameterName = "@Penanggung_Jawab"; pjParam.Value = (object)createDto.Penanggung_Jawab ?? DBNull.Value; cmd.Parameters.Add(pjParam);

                var newGrantId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                var createdGrant = new HibahDto
                {
                    id_Hibah = newGrantId,
                    Nama_Hibah = createDto.Nama_Hibah,
                    Keterangan = createDto.Keterangan,
                    Tahun = createDto.Tahun,
                    Penanggung_Jawab = createDto.Penanggung_Jawab
                };
                return CreatedAtAction(nameof(GetGrantById), new { id = newGrantId }, createdGrant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating grant.");
                return StatusCode(500, new { message = "An internal server error occurred while creating grant." });
            }
        }

        /// <summary>
        /// Updates an existing grant.
        /// </summary>
        /// <param name="id">The ID of the grant to update.</param>
        /// <param name="updateDto">The DTO containing updated grant details.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGrant(int id, [FromBody] UpdateHibahDto updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: UPDATE statement for hibah table - only schema-defined columns
                cmd.CommandText = @"
                    UPDATE hibah
                    SET Nama_Hibah = @Nama_Hibah, Keterangan = @Keterangan, Tahun = @Tahun, Penanggung_Jawab = @Penanggung_Jawab
                    WHERE id_Hibah = @id_Hibah;";

                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Hibah"; idParam.Value = id; cmd.Parameters.Add(idParam);
                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Hibah"; namaParam.Value = updateDto.Nama_Hibah; cmd.Parameters.Add(namaParam);
                var keteranganParam = cmd.CreateParameter(); keteranganParam.ParameterName = "@Keterangan"; keteranganParam.Value = (object)updateDto.Keterangan ?? DBNull.Value; cmd.Parameters.Add(keteranganParam);
                var tahunParam = cmd.CreateParameter(); tahunParam.ParameterName = "@Tahun"; tahunParam.Value = (object)updateDto.Tahun ?? DBNull.Value; cmd.Parameters.Add(tahunParam);
                var pjParam = cmd.CreateParameter(); pjParam.ParameterName = "@Penanggung_Jawab"; pjParam.Value = (object)updateDto.Penanggung_Jawab ?? DBNull.Value; cmd.Parameters.Add(pjParam);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = $"Grant with ID {id} not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating grant with ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while updating grant." });
            }
        }

        /// <summary>
        /// Deletes a grant.
        /// </summary>
        /// <param name="id">The ID of the grant to delete.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGrant(int id)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: DELETE statement - only id_Hibah
                cmd.CommandText = "DELETE FROM hibah WHERE id_Hibah = @id_Hibah;";
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Hibah"; idParam.Value = id; cmd.Parameters.Add(idParam);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected > 0) return NoContent();

                return NotFound(new { message = $"Grant with ID {id} not found." });
            }
            catch (DbException dbEx) // Catch specific DbException for foreign key, check error code for your DB
            {
                // Re-check: MySql.Data.MySqlClient.MySqlException or MySqlConnector.MySqlException
                // Assuming MySqlConnector is used, but keeping MySql.Data check for robustness if both are present
                _logger.LogError(dbEx, $"Database error deleting grant ID {id}.");
                return StatusCode(500, new { message = "A database error occurred while deleting the grant." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting grant ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while deleting the grant." });
            }
        }
    }
}
