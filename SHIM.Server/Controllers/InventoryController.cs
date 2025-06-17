// YourAspNetCoreProject/Controllers/InventoryController.cs
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
    [Route("api/inventory")]
    [Authorize] // General authorization, specific methods might have stricter roles
    public class InventoryController : ControllerBase
    {
        private readonly ILogger<InventoryController> _logger;
        private readonly IConnectionService _connectionService;

        public InventoryController(ILogger<InventoryController> logger, IConnectionService connectionService)
        {
            _logger = logger;
            _connectionService = connectionService;
        }

        /// <summary>
        /// Retrieves a paginated list of available inventory items.
        /// </summary>
        /// <param name="paginationParams">Pagination parameters (PageNumber, PageSize).</param>
        /// <returns>A paginated list of available items.</returns>
        [HttpGet]
        [AllowAnonymous] // Publicly accessible to browse available items
        public async Task<IActionResult> GetAvailableInventory([FromQuery] PaginationParams paginationParams)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                int offset = (paginationParams.PageNumber - 1) * paginationParams.PageSize;

                // Re-check: COUNT(*) query
                cmd.CommandText = "SELECT COUNT(*) FROM barang WHERE Status_Barang = 'Available' OR Status_Barang = 'Tersedia';";
                long totalRecords = (long)await cmd.ExecuteScalarAsync();
                cmd.Parameters.Clear();

                // Re-check: SELECT for paged items - only schema-defined columns from barang, plus Nama_Hibah from join
                cmd.CommandText = @"
                    SELECT b.id_Barang, b.Nama_Barang, b.Deskripsi_Barang, b.Status_Kondisi, b.Status_Barang,
                           b.Tanggal_Perolehan, b.Harga_Barang, b.id_Hibah, h.Nama_Hibah -- Added h.Nama_Hibah
                    FROM barang b
                    LEFT JOIN hibah h ON b.id_Hibah = h.id_Hibah -- Added LEFT JOIN for Nama_Hibah
                    WHERE b.Status_Barang = 'Available' OR b.Status_Barang = 'Tersedia'
                    ORDER BY b.Nama_Barang ASC
                    LIMIT @PageSize OFFSET @Offset;";

                var pageSizeParam = cmd.CreateParameter(); pageSizeParam.ParameterName = "@PageSize"; pageSizeParam.Value = paginationParams.PageSize; cmd.Parameters.Add(pageSizeParam);
                var offsetParam = cmd.CreateParameter(); offsetParam.ParameterName = "@Offset"; offsetParam.Value = offset; cmd.Parameters.Add(offsetParam);

                var items = new List<BarangDto>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    items.Add(new BarangDto
                    {
                        id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        Deskripsi_Barang = reader.IsDBNull(reader.GetOrdinal("Deskripsi_Barang")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi_Barang")),
                        Status_Kondisi = reader.IsDBNull(reader.GetOrdinal("Status_Kondisi")) ? null : reader.GetString(reader.GetOrdinal("Status_Kondisi")),
                        Status_Barang = reader.GetString(reader.GetOrdinal("Status_Barang")),
                        Tanggal_Perolehan = reader.GetDateTime(reader.GetOrdinal("Tanggal_Perolehan")),
                        Harga_Barang = reader.IsDBNull(reader.GetOrdinal("Harga_Barang")) ? (long?)null : reader.GetInt64(reader.GetOrdinal("Harga_Barang")),
                        id_Hibah = reader.IsDBNull(reader.GetOrdinal("id_Hibah")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("id_Hibah")),
                        Nama_Hibah = reader.IsDBNull(reader.GetOrdinal("Nama_Hibah")) ? null : reader.GetString(reader.GetOrdinal("Nama_Hibah")) // Now correctly mapping Nama_Hibah
                    });
                }

                var paginatedResponse = new PaginatedResponse<BarangDto>(items, paginationParams.PageNumber, paginationParams.PageSize, totalRecords);
                return Ok(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching available inventory.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching available inventory." });
            }
        }

        /// <summary>
        /// Retrieves a paginated list of all inventory items (for administrators).
        /// </summary>
        /// <param name="paginationParams">Pagination parameters (PageNumber, PageSize).</param>
        /// <returns>A paginated list of all inventory items.</returns>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Only admins can see all inventory items
        public async Task<IActionResult> GetAllInventory([FromQuery] PaginationParams paginationParams)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                int offset = (paginationParams.PageNumber - 1) * paginationParams.PageSize;

                // Re-check: COUNT(*) query
                cmd.CommandText = "SELECT COUNT(*) FROM barang;";
                long totalRecords = (long)await cmd.ExecuteScalarAsync();
                cmd.Parameters.Clear();

                // Re-check: SELECT for paged items - schema-defined columns + Nama_Hibah (derived from join)
                cmd.CommandText = @"
                    SELECT
                        b.id_Barang, b.Nama_Barang, b.Deskripsi_Barang, b.Status_Kondisi, b.Status_Barang,
                        b.Tanggal_Perolehan, b.Harga_Barang, b.id_Hibah, h.Nama_Hibah,
                        -- Assuming Tanggal_Pengajuan exists in peminjaman table for Latest_Booking_Date
                        (SELECT MAX(p_sub.Tanggal_Pengajuan)
                         FROM peminjaman p_sub
                         WHERE p_sub.id_Barang = b.id_Barang) AS Latest_Booking_Date
                    FROM barang b
                    LEFT JOIN hibah h ON b.id_Hibah = h.id_Hibah
                    ORDER BY b.id_Barang DESC
                    LIMIT @PageSize OFFSET @Offset;";

                var pageSizeParam = cmd.CreateParameter(); pageSizeParam.ParameterName = "@PageSize"; pageSizeParam.Value = paginationParams.PageSize; cmd.Parameters.Add(pageSizeParam);
                var offsetParam = cmd.CreateParameter(); offsetParam.ParameterName = "@Offset"; offsetParam.Value = offset; cmd.Parameters.Add(offsetParam);

                var items = new List<BarangDto>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    items.Add(new BarangDto
                    {
                        id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        Deskripsi_Barang = reader.IsDBNull(reader.GetOrdinal("Deskripsi_Barang")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi_Barang")),
                        Status_Kondisi = reader.IsDBNull(reader.GetOrdinal("Status_Kondisi")) ? null : reader.GetString(reader.GetOrdinal("Status_Kondisi")),
                        Status_Barang = reader.GetString(reader.GetOrdinal("Status_Barang")),
                        Tanggal_Perolehan = reader.GetDateTime(reader.GetOrdinal("Tanggal_Perolehan")),
                        Harga_Barang = reader.IsDBNull(reader.GetOrdinal("Harga_Barang")) ? (long?)null : reader.GetInt64(reader.GetOrdinal("Harga_Barang")),
                        id_Hibah = reader.IsDBNull(reader.GetOrdinal("id_Hibah")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("id_Hibah")),
                        Nama_Hibah = reader.IsDBNull(reader.GetOrdinal("Nama_Hibah")) ? null : reader.GetString(reader.GetOrdinal("Nama_Hibah")), // Correctly mapping Nama_Hibah
                        Latest_Booking_Date = reader.IsDBNull(reader.GetOrdinal("Latest_Booking_Date")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Latest_Booking_Date"))
                    });
                }
                var paginatedResponse = new PaginatedResponse<BarangDto>(items, paginationParams.PageNumber, paginationParams.PageSize, totalRecords);
                return Ok(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all inventory for admin.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching all inventory." });
            }
        }

        /// <summary>
        /// Retrieves details for a specific inventory item by ID.
        /// </summary>
        /// <param name="id">The ID of the inventory item.</param>
        /// <returns>The inventory item details.</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")] // Allow users to view details too
        public async Task<IActionResult> GetInventoryItemById(int id)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: SELECT statement for single item - schema-defined columns + Nama_Hibah from join
                cmd.CommandText = @"
                    SELECT b.id_Barang, b.Nama_Barang, b.Deskripsi_Barang, b.Status_Kondisi, b.Status_Barang,
                           b.Tanggal_Perolehan, b.Harga_Barang, b.id_Hibah, h.Nama_Hibah -- Added h.Nama_Hibah
                    FROM barang b
                    LEFT JOIN hibah h ON b.id_Hibah = h.id_Hibah -- Added LEFT JOIN for Nama_Hibah
                    WHERE b.id_Barang = @id_Barang;";
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Barang"; idParam.Value = id; cmd.Parameters.Add(idParam);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = new BarangDto
                    {
                        id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        Deskripsi_Barang = reader.IsDBNull(reader.GetOrdinal("Deskripsi_Barang")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi_Barang")),
                        Status_Kondisi = reader.IsDBNull(reader.GetOrdinal("Status_Kondisi")) ? null : reader.GetString(reader.GetOrdinal("Status_Kondisi")),
                        Status_Barang = reader.GetString(reader.GetOrdinal("Status_Barang")),
                        Tanggal_Perolehan = reader.GetDateTime(reader.GetOrdinal("Tanggal_Perolehan")),
                        Harga_Barang = reader.IsDBNull(reader.GetOrdinal("Harga_Barang")) ? (long?)null : reader.GetInt64(reader.GetOrdinal("Harga_Barang")),
                        id_Hibah = reader.IsDBNull(reader.GetOrdinal("id_Hibah")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("id_Hibah")),
                        Nama_Hibah = reader.IsDBNull(reader.GetOrdinal("Nama_Hibah")) ? null : reader.GetString(reader.GetOrdinal("Nama_Hibah")) // Now correctly mapping Nama_Hibah
                    };
                    return Ok(item);
                }
                return NotFound(new { message = $"Inventory item with ID {id} not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching inventory item with ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching inventory item details." });
            }
        }

        /// <summary>
        /// Creates a new inventory item.
        /// </summary>
        /// <param name="barangDto">The DTO containing item details.</param>
        /// <returns>201 Created with the new item, or error.</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateInventoryItem([FromBody] CreateBarangDto barangDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: INSERT statement for barang table - only schema-defined columns
                cmd.CommandText = @"
                    INSERT INTO barang
                        (Nama_Barang, Deskripsi_Barang, Status_Kondisi, Tanggal_Perolehan, Status_Barang, Harga_Barang, id_Hibah)
                    VALUES
                        (@Nama_Barang, @Deskripsi_Barang, @Status_Kondisi, @Tanggal_Perolehan, @Status_Barang, @Harga_Barang, @id_Hibah);
                    SELECT LAST_INSERT_ID();";

                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Barang"; namaParam.Value = barangDto.Nama_Barang; cmd.Parameters.Add(namaParam);
                var descParam = cmd.CreateParameter(); descParam.ParameterName = "@Deskripsi_Barang"; descParam.Value = (object)barangDto.Deskripsi_Barang ?? DBNull.Value; cmd.Parameters.Add(descParam);
                var kondisiParam = cmd.CreateParameter(); kondisiParam.ParameterName = "@Status_Kondisi"; kondisiParam.Value = (object)barangDto.Status_Kondisi ?? DBNull.Value; cmd.Parameters.Add(kondisiParam);
                var tglParam = cmd.CreateParameter(); tglParam.ParameterName = "@Tanggal_Perolehan"; tglParam.Value = barangDto.Tanggal_Perolehan; cmd.Parameters.Add(tglParam);
                var statusBarangParam = cmd.CreateParameter(); statusBarangParam.ParameterName = "@Status_Barang"; statusBarangParam.Value = barangDto.Status_Barang; cmd.Parameters.Add(statusBarangParam);
                var hargaParam = cmd.CreateParameter(); hargaParam.ParameterName = "@Harga_Barang"; hargaParam.Value = (object)barangDto.Harga_Barang ?? DBNull.Value; cmd.Parameters.Add(hargaParam);
                var hibahParam = cmd.CreateParameter(); hibahParam.ParameterName = "@id_Hibah"; hibahParam.Value = (object)barangDto.id_Hibah ?? DBNull.Value; cmd.Parameters.Add(hibahParam);

                var newItemId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                var createdItem = new BarangDto
                {
                    id_Barang = newItemId,
                    Nama_Barang = barangDto.Nama_Barang,
                    Deskripsi_Barang = barangDto.Deskripsi_Barang,
                    Status_Kondisi = barangDto.Status_Kondisi,
                    Tanggal_Perolehan = barangDto.Tanggal_Perolehan,
                    Status_Barang = barangDto.Status_Barang,
                    Harga_Barang = barangDto.Harga_Barang,
                    id_Hibah = barangDto.id_Hibah,
                    Nama_Hibah = null // Nama_Hibah is not available on creation, set to null or re-fetch if needed
                };
                return CreatedAtAction(nameof(GetInventoryItemById), new { id = newItemId }, createdItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inventory item.");
                return StatusCode(500, new { message = "An internal server error occurred while creating inventory item." });
            }
        }

        /// <summary>
        /// Updates an existing inventory item.
        /// </summary>
        /// <param name="id">The ID of the item to update.</param>
        /// <param name="barangDto">The DTO containing updated item details.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateInventoryItem(int id, [FromBody] UpdateBarangDto barangDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: UPDATE statement for barang table - only schema-defined columns
                cmd.CommandText = @"
                    UPDATE barang
                    SET Nama_Barang = @Nama_Barang, Deskripsi_Barang = @Deskripsi_Barang, Status_Kondisi = @Status_Kondisi,
                        Tanggal_Perolehan = @Tanggal_Perolehan, Status_Barang = @Status_Barang, Harga_Barang = @Harga_Barang, id_Hibah = @id_Hibah
                    WHERE id_Barang = @id_Barang;";

                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Barang"; idParam.Value = id; cmd.Parameters.Add(idParam);
                var namaParam = cmd.CreateParameter(); namaParam.ParameterName = "@Nama_Barang"; namaParam.Value = barangDto.Nama_Barang; cmd.Parameters.Add(namaParam);
                var descParam = cmd.CreateParameter(); descParam.ParameterName = "@Deskripsi_Barang"; descParam.Value = (object)barangDto.Deskripsi_Barang ?? DBNull.Value; cmd.Parameters.Add(descParam);
                var kondisiParam = cmd.CreateParameter(); kondisiParam.ParameterName = "@Status_Kondisi"; kondisiParam.Value = (object)barangDto.Status_Kondisi ?? DBNull.Value; cmd.Parameters.Add(kondisiParam);
                var tglParam = cmd.CreateParameter(); tglParam.ParameterName = "@Tanggal_Perolehan"; tglParam.Value = barangDto.Tanggal_Perolehan; cmd.Parameters.Add(tglParam);
                var statusBarangParam = cmd.CreateParameter(); statusBarangParam.ParameterName = "@Status_Barang"; statusBarangParam.Value = barangDto.Status_Barang; cmd.Parameters.Add(statusBarangParam);
                var hargaParam = cmd.CreateParameter(); hargaParam.ParameterName = "@Harga_Barang"; hargaParam.Value = (object)barangDto.Harga_Barang ?? DBNull.Value; cmd.Parameters.Add(hargaParam);
                var hibahParam = cmd.CreateParameter(); hibahParam.ParameterName = "@id_Hibah"; hibahParam.Value = (object)barangDto.id_Hibah ?? DBNull.Value; cmd.Parameters.Add(hibahParam);


                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = $"Inventory item with ID {id} not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating inventory item with ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while updating inventory item." });
            }
        }

        /// <summary>
        /// Updates the status of an inventory item.
        /// </summary>
        /// <param name="id">The ID of the item to update.</param>
        /// <param name="statusDto">The DTO containing the new status.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateInventoryItemStatus(int id, [FromBody] UpdateBarangStatusDto statusDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: UPDATE statement for Status_Barang - only Status_Barang and id_Barang
                cmd.CommandText = "UPDATE barang SET Status_Barang = @Status_Barang WHERE id_Barang = @id_Barang;";
                var statusParam = cmd.CreateParameter(); statusParam.ParameterName = "@Status_Barang"; statusParam.Value = statusDto.Status_Barang; cmd.Parameters.Add(statusParam);
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Barang"; idParam.Value = id; cmd.Parameters.Add(idParam);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected > 0 ? NoContent() : NotFound(new { message = $"Inventory item with ID {id} not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating status for inventory item ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while updating item status." });
            }
        }

        /// <summary>
        /// Deletes an inventory item.
        /// </summary>
        /// <param name="id">The ID of the item to delete.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteInventoryItem(int id)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                // Re-check: DELETE statement - only id_Barang
                cmd.CommandText = "DELETE FROM barang WHERE id_Barang = @id_Barang;";
                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@id_Barang"; idParam.Value = id; cmd.Parameters.Add(idParam);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected > 0) return NoContent();

                return NotFound(new { message = $"Inventory item with ID {id} not found." });
            }
            catch (DbException dbEx) // Catch specific DbException for foreign key, check error code for your DB
            {
                // Re-check: MySql.Data.MySqlClient.MySqlException or MySqlConnector.MySqlException
                // Assuming MySqlConnector is used, but keeping MySql.Data check for robustness if both are present

                _logger.LogError(dbEx, $"Database error deleting inventory item ID {id}.");
                return StatusCode(500, new { message = "A database error occurred while deleting the item." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting inventory item ID {id}.");
                return StatusCode(500, new { message = "An internal server error occurred while deleting the item." });
            }
        }
    }
}
