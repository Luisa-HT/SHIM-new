// YourAspNetCoreProject/Controllers/BookingsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Security.Claims;
using System.Threading.Tasks;
using SHIM.Server.Models.DTOs; // Ensure this namespace matches your DTOs file
using SHIM.Server.Services.Interfaces; // For IConnectionService
// For DbException specific error codes, you might need:

namespace SHIM.Server.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize] // All booking actions require authentication
    public class BookingsController : ControllerBase
    {
        private readonly ILogger<BookingsController> _logger;
        private readonly IConnectionService _connectionService;

        public BookingsController(ILogger<BookingsController> logger, IConnectionService connectionService)
        {
            _logger = logger;
            _connectionService = connectionService;
        }

        private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string GetCurrentAdminId() => User.FindFirstValue(ClaimTypes.NameIdentifier); // Admin ID is also stored as NameIdentifier

        /// <summary>
        /// Creates a new booking request by an authenticated user.
        /// </summary>
        /// <param name="bookingRequest">The DTO containing booking details.</param>
        /// <returns>201 Created on success, or error.</returns>
        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequestDto bookingRequest)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId)) return Unauthorized(new { message = "User ID not found in token." });

            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Basic validation: End date must be after start date
            if (bookingRequest.Start_Date >= bookingRequest.End_Date)
            {
                return BadRequest(new { message = "End date must be after start date." });
            }

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Check if the item exists and is 'Available' or 'Tersedia'
                cmd.CommandText = "SELECT Status_Barang FROM barang WHERE id_Barang = @id_Barang;";
                var barangIdParamCheck = cmd.CreateParameter(); barangIdParamCheck.ParameterName = "@id_Barang"; barangIdParamCheck.Value = bookingRequest.id_Barang; cmd.Parameters.Add(barangIdParamCheck);
                var itemStatus = await cmd.ExecuteScalarAsync() as string;
                cmd.Parameters.Clear();

                if (itemStatus == null)
                {
                    return NotFound(new { message = $"Item with ID {bookingRequest.id_Barang} not found." });
                }
                if (itemStatus != "Available" && itemStatus != "Tersedia")
                {
                    return Conflict(new { message = $"Item is currently '{itemStatus}' and cannot be booked." });
                }

                // Re-check: Check for overlapping bookings for the item
                cmd.CommandText = @"
                    SELECT COUNT(*) FROM peminjaman
                    WHERE id_Barang = @id_Barang
                    AND (
                        (Start_Date <= @EndDate AND End_Date >= @StartDate)
                        OR (Start_Date = @EndDate) OR (End_Date = @StartDate)
                    )
                    AND Status_Peminjaman IN ('Pending', 'Approved');"; // Only consider pending/approved bookings for overlap

                var barangIdParamOverlap = cmd.CreateParameter(); barangIdParamOverlap.ParameterName = "@id_Barang"; barangIdParamOverlap.Value = bookingRequest.id_Barang; cmd.Parameters.Add(barangIdParamOverlap);
                var startDateParam = cmd.CreateParameter(); startDateParam.ParameterName = "@StartDate"; startDateParam.Value = bookingRequest.Start_Date; cmd.Parameters.Add(startDateParam);
                var endDateParam = cmd.CreateParameter(); endDateParam.ParameterName = "@EndDate"; endDateParam.Value = bookingRequest.End_Date; cmd.Parameters.Add(endDateParam);

                long overlappingBookings = (long)await cmd.ExecuteScalarAsync();
                if (overlappingBookings > 0)
                {
                    return Conflict(new { message = "The item is already booked for the requested time period." });
                }
                cmd.Parameters.Clear();

                // Re-check: Create the booking entry (Status_Peminjaman will be 'Pending' by default)
                // ASSUMPTION: The 'peminjaman' table has 'Tanggal_Pengajuan' column.
                cmd.CommandText = @"
                    INSERT INTO peminjaman (id_Peminjam, id_Barang, Start_Date, End_Date, Deskripsi, Status_Peminjaman, Tanggal_Pengajuan)
                    VALUES (@id_Peminjam, @id_Barang, @Start_Date, @End_Date, @Deskripsi, 'Pending', @Tanggal_Pengajuan);
                    SELECT LAST_INSERT_ID();";

                var peminjamIdParam = cmd.CreateParameter(); peminjamIdParam.ParameterName = "@id_Peminjam"; peminjamIdParam.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(peminjamIdParam);
                var idBarangParam = cmd.CreateParameter(); idBarangParam.ParameterName = "@id_Barang"; idBarangParam.Value = bookingRequest.id_Barang; cmd.Parameters.Add(idBarangParam);
                var startDateParamInsert = cmd.CreateParameter(); startDateParamInsert.ParameterName = "@Start_Date"; startDateParamInsert.Value = bookingRequest.Start_Date; cmd.Parameters.Add(startDateParamInsert);
                var endDateParamInsert = cmd.CreateParameter(); endDateParamInsert.ParameterName = "@End_Date"; endDateParamInsert.Value = bookingRequest.End_Date; cmd.Parameters.Add(endDateParamInsert);
                var deskripsiParam = cmd.CreateParameter(); deskripsiParam.ParameterName = "@Deskripsi"; deskripsiParam.Value = (object)bookingRequest.Deskripsi ?? DBNull.Value; cmd.Parameters.Add(deskripsiParam);
                var tanggalPengajuanParam = cmd.CreateParameter(); tanggalPengajuanParam.ParameterName = "@Tanggal_Pengajuan"; tanggalPengajuanParam.Value = DateTime.Now; cmd.Parameters.Add(tanggalPengajuanParam); // Record submission time

                var newBookingId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                if (newBookingId > 0)
                {
                    return Created($"/api/bookings/{newBookingId}", new { id_Peminjaman = newBookingId, message = "Booking request submitted successfully." });
                }
                return BadRequest(new { message = "Failed to submit booking request." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking request for user {UserId} and item {ItemId}.", currentUserId, bookingRequest.id_Barang);
                return StatusCode(500, new { message = "An internal server error occurred while submitting the booking request." });
            }
        }

        /// <summary>
        /// Retrieves the booking history for the currently authenticated user.
        /// </summary>
        /// <param name="paginationParams">Pagination parameters.</param>
        /// <returns>A paginated list of the user's booking history.</returns>
        [HttpGet("my-history")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyBookingHistory([FromQuery] PaginationParams paginationParams)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId)) return Unauthorized(new { message = "User ID not found in token." });

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                int offset = (paginationParams.PageNumber - 1) * paginationParams.PageSize;

                // Re-check: COUNT(*) query for user's bookings
                cmd.CommandText = "SELECT COUNT(*) FROM peminjaman WHERE id_Peminjam = @CurrentUserId;";
                var countIdParam = cmd.CreateParameter(); countIdParam.ParameterName = "@CurrentUserId"; countIdParam.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(countIdParam);
                long totalRecords = (long)await cmd.ExecuteScalarAsync();
                cmd.Parameters.Clear();

                // Re-check: SELECT for paged booking history
                // ASSUMPTION: The 'peminjaman' table has 'Denda', 'Alasan_Penolakan', 'Tanggal_Pengajuan', 'Tanggal_Approval', 'Tanggal_Pengembalian_Aktual' columns.
                cmd.CommandText = @"
                    SELECT p.id_Peminjaman, p.Start_Date, p.End_Date, p.Deskripsi, p.Status_Peminjaman, p.Denda,
                           p.Alasan_Penolakan, p.Tanggal_Pengajuan, p.Tanggal_Approval, p.Tanggal_Pengembalian_Aktual,
                           b.Nama_Barang
                    FROM peminjaman p
                    JOIN barang b ON p.id_Barang = b.id_Barang
                    WHERE p.id_Peminjam = @CurrentUserId
                    ORDER BY p.Tanggal_Pengajuan DESC
                    LIMIT @PageSize OFFSET @Offset;";

                var idParam = cmd.CreateParameter(); idParam.ParameterName = "@CurrentUserId"; idParam.Value = Convert.ToInt32(currentUserId); cmd.Parameters.Add(idParam);
                var pageSizeParam = cmd.CreateParameter(); pageSizeParam.ParameterName = "@PageSize"; pageSizeParam.Value = paginationParams.PageSize; cmd.Parameters.Add(pageSizeParam);
                var offsetParam = cmd.CreateParameter(); offsetParam.ParameterName = "@Offset"; offsetParam.Value = offset; cmd.Parameters.Add(offsetParam);

                var history = new List<BookingHistoryDto>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    history.Add(new BookingHistoryDto
                    {
                        id_Peminjaman = reader.GetInt32(reader.GetOrdinal("id_Peminjaman")),
                        Start_Date = reader.GetDateTime(reader.GetOrdinal("Start_Date")),
                        End_Date = reader.GetDateTime(reader.GetOrdinal("End_Date")),
                        Deskripsi = reader.IsDBNull(reader.GetOrdinal("Deskripsi")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi")),
                        Status_Peminjaman = reader.GetString(reader.GetOrdinal("Status_Peminjaman")),
                        Denda = reader.IsDBNull(reader.GetOrdinal("Denda")) ? (long?)null : reader.GetInt64(reader.GetOrdinal("Denda")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        Alasan_Penolakan = reader.IsDBNull(reader.GetOrdinal("Alasan_Penolakan")) ? null : reader.GetString(reader.GetOrdinal("Alasan_Penolakan")),
                        Tanggal_Pengajuan = reader.IsDBNull(reader.GetOrdinal("Tanggal_Pengajuan")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Pengajuan")),
                        Tanggal_Approval = reader.IsDBNull(reader.GetOrdinal("Tanggal_Approval")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Approval")),
                        Tanggal_Pengembalian_Aktual = reader.IsDBNull(reader.GetOrdinal("Tanggal_Pengembalian_Aktual")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Pengembalian_Aktual"))
                    });
                }
                var paginatedResponse = new PaginatedResponse<BookingHistoryDto>(history, paginationParams.PageNumber, paginationParams.PageSize, totalRecords);
                return Ok(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching booking history for user ID: {UserId}", currentUserId);
                return StatusCode(500, new { message = "An internal server error occurred while fetching booking history." });
            }
        }

        // --- Admin Endpoints ---

        /// <summary>
        /// Retrieves dashboard statistics for administrators.
        /// </summary>
        /// <returns>AdminDashboardStatsDto containing counts.</returns>
        [HttpGet("admin/dashboard-stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboardStats()
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Count of Pending Requests
                cmd.CommandText = "SELECT COUNT(*) FROM peminjaman WHERE Status_Peminjaman = 'Pending';";
                int pendingCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                // Re-check: Count of Today's Bookings (assuming start date is today)
                cmd.CommandText = @"
                    SELECT COUNT(*) FROM peminjaman
                    WHERE DATE(Start_Date) = CURDATE() AND Status_Peminjaman IN ('Approved', 'Pending');"; // Count approved or pending for today
                int todaysBookingsCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                var stats = new AdminDashboardStatsDto
                {
                    PendingCount = pendingCount,
                    TodaysBookingsCount = todaysBookingsCount
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admin dashboard stats.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching dashboard stats." });
            }
        }

        /// <summary>
        /// Retrieves a paginated list of pending booking requests for admin review.
        /// </summary>
        /// <param name="paginationParams">Pagination parameters.</param>
        /// <returns>A paginated list of pending booking requests.</returns>
        [HttpGet("admin/pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingBookingRequests([FromQuery] PaginationParams paginationParams)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                int offset = (paginationParams.PageNumber - 1) * paginationParams.PageSize;

                // Re-check: COUNT(*) query for pending records
                cmd.CommandText = "SELECT COUNT(*) FROM peminjaman WHERE Status_Peminjaman = 'Pending';";
                long totalRecords = (long)await cmd.ExecuteScalarAsync();
                cmd.Parameters.Clear();

                // Re-check: SELECT for paged pending requests
                // ASSUMPTION: The 'peminjaman' table has 'Tanggal_Pengajuan' column.
                cmd.CommandText = @"
                    SELECT p.id_Peminjaman, p.Start_Date, p.End_Date, p.Deskripsi, p.Status_Peminjaman, p.Tanggal_Pengajuan,
                           b.Nama_Barang, b.id_Barang,
                           usr.Nama_Peminjam, usr.id_Peminjam, usr.Email AS Peminjam_Email, usr.No_Telp AS Peminjam_No_Telp
                    FROM peminjaman p
                    JOIN barang b ON p.id_Barang = b.id_Barang
                    JOIN peminjam usr ON p.id_Peminjam = usr.id_Peminjam
                    WHERE p.Status_Peminjaman = 'Pending'
                    ORDER BY p.Tanggal_Pengajuan ASC
                    LIMIT @PageSize OFFSET @Offset;";

                var pageSizeParam = cmd.CreateParameter(); pageSizeParam.ParameterName = "@PageSize"; pageSizeParam.Value = paginationParams.PageSize; cmd.Parameters.Add(pageSizeParam);
                var offsetParam = cmd.CreateParameter(); offsetParam.ParameterName = "@Offset"; offsetParam.Value = offset; cmd.Parameters.Add(offsetParam);

                var requests = new List<AdminBookingRequestDto>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    requests.Add(new AdminBookingRequestDto
                    {
                        id_Peminjaman = reader.GetInt32(reader.GetOrdinal("id_Peminjaman")),
                        Start_Date = reader.GetDateTime(reader.GetOrdinal("Start_Date")),
                        End_Date = reader.GetDateTime(reader.GetOrdinal("End_Date")),
                        Deskripsi = reader.IsDBNull(reader.GetOrdinal("Deskripsi")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi")),
                        Status_Peminjaman = reader.GetString(reader.GetOrdinal("Status_Peminjaman")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                        Nama_Peminjam = reader.GetString(reader.GetOrdinal("Nama_Peminjam")),
                        id_Peminjam = reader.GetInt32(reader.GetOrdinal("id_Peminjam")),
                        Peminjam_Email = reader.GetString(reader.GetOrdinal("Peminjam_Email")),
                        Peminjam_No_Telp = reader.IsDBNull(reader.GetOrdinal("Peminjam_No_Telp")) ? null : reader.GetString(reader.GetOrdinal("Peminjam_No_Telp")),
                        Tanggal_Pengajuan = reader.IsDBNull(reader.GetOrdinal("Tanggal_Pengajuan")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Pengajuan"))
                    });
                }
                var paginatedResponse = new PaginatedResponse<AdminBookingRequestDto>(requests, paginationParams.PageNumber, paginationParams.PageSize, totalRecords);
                return Ok(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending booking requests for admin.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching pending booking requests." });
            }
        }

        /// <summary>
        /// Retrieves details for a specific booking request (for admin review).
        /// </summary>
        /// <param name="id">The ID of the booking request.</param>
        /// <returns>The detailed booking request.</returns>
        [HttpGet("admin/requests/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminBookingRequestById(int id)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: SELECT for single booking request details
                // ASSUMPTION: The 'peminjaman' table has 'Tanggal_Pengajuan' column.
                cmd.CommandText = @"
                    SELECT p.id_Peminjaman, p.Start_Date, p.End_Date, p.Deskripsi, p.Status_Peminjaman, p.Tanggal_Pengajuan,
                           b.Nama_Barang, b.id_Barang,
                           usr.Nama_Peminjam, usr.id_Peminjam, usr.Email AS Peminjam_Email, usr.No_Telp AS Peminjam_No_Telp
                    FROM peminjaman p
                    JOIN barang b ON p.id_Barang = b.id_Barang
                    JOIN peminjam usr ON p.id_Peminjam = usr.id_Peminjam
                    WHERE p.id_Peminjaman = @BookingId;";

                var bookingIdParam = cmd.CreateParameter(); bookingIdParam.ParameterName = "@BookingId"; bookingIdParam.Value = id; cmd.Parameters.Add(bookingIdParam);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var request = new AdminBookingRequestDto
                    {
                        id_Peminjaman = reader.GetInt32(reader.GetOrdinal("id_Peminjaman")),
                        Start_Date = reader.GetDateTime(reader.GetOrdinal("Start_Date")),
                        End_Date = reader.GetDateTime(reader.GetOrdinal("End_Date")),
                        Deskripsi = reader.IsDBNull(reader.GetOrdinal("Deskripsi")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi")),
                        Status_Peminjaman = reader.GetString(reader.GetOrdinal("Status_Peminjaman")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                        Nama_Peminjam = reader.GetString(reader.GetOrdinal("Nama_Peminjam")),
                        id_Peminjam = reader.GetInt32(reader.GetOrdinal("id_Peminjam")),
                        Peminjam_Email = reader.GetString(reader.GetOrdinal("Peminjam_Email")),
                        Peminjam_No_Telp = reader.IsDBNull(reader.GetOrdinal("Peminjam_No_Telp")) ? null : reader.GetString(reader.GetOrdinal("Peminjam_No_Telp")),
                        Tanggal_Pengajuan = reader.IsDBNull(reader.GetOrdinal("Tanggal_Pengajuan")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Pengajuan"))
                    };
                    return Ok(request);
                }
                return NotFound(new { message = $"Booking request with ID {id} not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching booking request with ID: {BookingId} for admin.", id);
                return StatusCode(500, new { message = "An internal server error occurred while fetching booking request details." });
            }
        }


        /// <summary>
        /// Approves a pending booking request.
        /// </summary>
        /// <param name="id">The ID of the booking request to approve.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("admin/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId)) return Unauthorized(new { message = "Admin ID not found in token." });

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Get current status and item ID
                cmd.CommandText = "SELECT Status_Peminjaman, id_Barang FROM peminjaman WHERE id_Peminjaman = @BookingId;";
                var bookingIdParam = cmd.CreateParameter(); bookingIdParam.ParameterName = "@BookingId"; bookingIdParam.Value = id; cmd.Parameters.Add(bookingIdParam);

                string currentBookingStatus = null;
                int itemId = 0;
                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        currentBookingStatus = reader.GetString(reader.GetOrdinal("Status_Peminjaman"));
                        itemId = reader.GetInt32(reader.GetOrdinal("id_Barang"));
                    }
                }
                cmd.Parameters.Clear();

                if (currentBookingStatus == null) return NotFound(new { message = $"Booking request with ID {id} not found." });
                if (currentBookingStatus != "Pending") return Conflict(new { message = $"Booking request is not pending (current status: {currentBookingStatus})." });


                // Re-check: Update booking status to 'Approved' and set Tanggal_Approval and id_Admin
                // ASSUMPTION: The 'peminjaman' table has 'Tanggal_Approval' and 'id_Admin' columns.
                cmd.CommandText = @"
                    UPDATE peminjaman
                    SET Status_Peminjaman = 'Approved', Tanggal_Approval = @Tanggal_Approval, id_Admin = @id_Admin
                    WHERE id_Peminjaman = @BookingId;";
                var bookingIdParamUpdate = cmd.CreateParameter(); bookingIdParamUpdate.ParameterName = "@BookingId"; bookingIdParamUpdate.Value = id; cmd.Parameters.Add(bookingIdParamUpdate);
                var approvalDateParam = cmd.CreateParameter(); approvalDateParam.ParameterName = "@Tanggal_Approval"; approvalDateParam.Value = DateTime.Now; cmd.Parameters.Add(approvalDateParam);
                var adminIdParam = cmd.CreateParameter(); adminIdParam.ParameterName = "@id_Admin"; adminIdParam.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(adminIdParam);

                int rowsAffectedBooking = await cmd.ExecuteNonQueryAsync();
                cmd.Parameters.Clear();

                // Re-check: Update item status to 'Booked' in barang table
                cmd.CommandText = "UPDATE barang SET Status_Barang = 'Booked' WHERE id_Barang = @ItemId;";
                var itemIdParamUpdate = cmd.CreateParameter(); itemIdParamUpdate.ParameterName = "@ItemId"; itemIdParamUpdate.Value = itemId; cmd.Parameters.Add(itemIdParamUpdate);
                int rowsAffectedItem = await cmd.ExecuteNonQueryAsync();

                if (rowsAffectedBooking > 0 && rowsAffectedItem > 0)
                {
                    return NoContent();
                }
                return StatusCode(500, new { message = "Failed to approve booking and update item status." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving booking request ID: {BookingId} by admin {AdminId}.", id, currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while approving booking request." });
            }
        }

        /// <summary>
        /// Declines a pending booking request.
        /// </summary>
        /// <param name="id">The ID of the booking request to decline.</param>
        /// <param name="declineDto">The DTO containing the reason for decline.</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("admin/{id}/decline")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeclineBooking(int id, [FromBody] DeclineBookingDto declineDto)
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId)) return Unauthorized(new { message = "Admin ID not found in token." });

            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Get current status and item ID
                cmd.CommandText = "SELECT Status_Peminjaman, id_Barang FROM peminjaman WHERE id_Peminjaman = @BookingId;";
                var bookingIdParam = cmd.CreateParameter(); bookingIdParam.ParameterName = "@BookingId"; bookingIdParam.Value = id; cmd.Parameters.Add(bookingIdParam);

                string currentBookingStatus = null;
                int itemId = 0;
                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        currentBookingStatus = reader.GetString(reader.GetOrdinal("Status_Peminjaman"));
                        itemId = reader.GetInt32(reader.GetOrdinal("id_Barang"));
                    }
                }
                cmd.Parameters.Clear();

                if (currentBookingStatus == null) return NotFound(new { message = $"Booking request with ID {id} not found." });
                if (currentBookingStatus != "Pending") return Conflict(new { message = $"Booking request is not pending (current status: {currentBookingStatus})." });

                // Re-check: Update booking status to 'Declined' and set Alasan_Penolakan, Tanggal_Approval, id_Admin
                // ASSUMPTION: The 'peminjaman' table has 'Alasan_Penolakan', 'Tanggal_Approval', 'id_Admin' columns.
                cmd.CommandText = @"
                    UPDATE peminjaman
                    SET Status_Peminjaman = 'Declined', Alasan_Penolakan = @Alasan_Penolakan,
                        Tanggal_Approval = @Tanggal_Approval, id_Admin = @id_Admin
                    WHERE id_Peminjaman = @BookingId;";
                var bookingIdParamUpdate = cmd.CreateParameter(); bookingIdParamUpdate.ParameterName = "@BookingId"; bookingIdParamUpdate.Value = id; cmd.Parameters.Add(bookingIdParamUpdate);
                var alasanParam = cmd.CreateParameter(); alasanParam.ParameterName = "@Alasan_Penolakan"; alasanParam.Value = declineDto.Alasan_Penolakan; cmd.Parameters.Add(alasanParam);
                var approvalDateParam = cmd.CreateParameter(); approvalDateParam.ParameterName = "@Tanggal_Approval"; approvalDateParam.Value = DateTime.Now; cmd.Parameters.Add(approvalDateParam);
                var adminIdParam = cmd.CreateParameter(); adminIdParam.ParameterName = "@id_Admin"; adminIdParam.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(adminIdParam);

                int rowsAffectedBooking = await cmd.ExecuteNonQueryAsync();
                cmd.Parameters.Clear();

                // Re-check: Ensure item status remains 'Available' or 'Tersedia' as it was not booked.
                // This query assumes 'PendingBooking' is a status you might use in 'barang' table,
                // otherwise, it's just 'Available'.
                cmd.CommandText = "UPDATE barang SET Status_Barang = 'Available' WHERE id_Barang = @ItemId AND Status_Barang = 'PendingBooking';";
                var itemIdParamUpdate = cmd.CreateParameter(); itemIdParamUpdate.ParameterName = "@ItemId"; itemIdParamUpdate.Value = itemId; cmd.Parameters.Add(itemIdParamUpdate);
                await cmd.ExecuteNonQueryAsync();

                return rowsAffectedBooking > 0 ? NoContent() : StatusCode(500, new { message = "Failed to decline booking." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining booking request ID: {BookingId} by admin {AdminId}.", id, currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while declining booking request." });
            }
        }

        /// <summary>
        /// Marks a booking as completed/returned and updates item status.
        /// </summary>
        /// <param name="id">The ID of the booking to complete.</param>
        /// <param name="completeDto">The DTO containing return details (e.g., Denda, Status_Kondisi_Pengembalian).</param>
        /// <returns>204 No Content on success, or error.</returns>
        [HttpPut("admin/{id}/complete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CompleteBooking(int id, [FromBody] CompleteBookingDto completeDto)
        {
            var currentAdminId = GetCurrentAdminId();
            if (string.IsNullOrEmpty(currentAdminId)) return Unauthorized(new { message = "Admin ID not found in token." });

            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();

                // Re-check: Get current status and item ID
                cmd.CommandText = "SELECT Status_Peminjaman, id_Barang FROM peminjaman WHERE id_Peminjaman = @BookingId;";
                var bookingIdParam = cmd.CreateParameter(); bookingIdParam.ParameterName = "@BookingId"; bookingIdParam.Value = id; cmd.Parameters.Add(bookingIdParam);

                string currentBookingStatus = null;
                int itemId = 0;
                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        currentBookingStatus = reader.GetString(reader.GetOrdinal("Status_Peminjaman"));
                        itemId = reader.GetInt32(reader.GetOrdinal("id_Barang"));
                    }
                }
                cmd.Parameters.Clear();

                if (currentBookingStatus == null) return NotFound(new { message = $"Booking with ID {id} not found." });
                if (currentBookingStatus != "Approved") return Conflict(new { message = $"Booking is not approved (current status: {currentBookingStatus}). Only approved bookings can be completed." });

                // Re-check: Update booking status to 'Completed' and set Denda, Tanggal_Pengembalian_Aktual, id_Admin_Pengembalian
                // ASSUMPTION: The 'peminjaman' table has 'Denda', 'Tanggal_Pengembalian_Aktual', 'id_Admin_Pengembalian' columns.
                cmd.CommandText = @"
                    UPDATE peminjaman
                    SET Status_Peminjaman = 'Completed', Denda = @Denda,
                        Tanggal_Pengembalian_Aktual = @Tanggal_Pengembalian_Aktual, id_Admin_Pengembalian = @id_Admin_Pengembalian
                    WHERE id_Peminjaman = @BookingId;";
                var bookingIdParamUpdate = cmd.CreateParameter(); bookingIdParamUpdate.ParameterName = "@BookingId"; bookingIdParamUpdate.Value = id; cmd.Parameters.Add(bookingIdParamUpdate);
                var dendaParam = cmd.CreateParameter(); dendaParam.ParameterName = "@Denda"; dendaParam.Value = (object)completeDto.Denda ?? DBNull.Value; cmd.Parameters.Add(dendaParam);
                var actualReturnDateParam = cmd.CreateParameter(); actualReturnDateParam.ParameterName = "@Tanggal_Pengembalian_Aktual"; actualReturnDateParam.Value = DateTime.Now; cmd.Parameters.Add(actualReturnDateParam);
                var adminReturnIdParam = cmd.CreateParameter(); adminReturnIdParam.ParameterName = "@id_Admin_Pengembalian"; adminReturnIdParam.Value = Convert.ToInt32(currentAdminId); cmd.Parameters.Add(adminReturnIdParam);

                int rowsAffectedBooking = await cmd.ExecuteNonQueryAsync();
                cmd.Parameters.Clear();

                // Re-check: Update item status back to 'Available' and update its condition status
                // ASSUMPTION: 'Status_Kondisi' column exists in 'barang' table.
                cmd.CommandText = "UPDATE barang SET Status_Barang = 'Available', Status_Kondisi = @Status_Kondisi_Pengembalian WHERE id_Barang = @ItemId;";
                var itemIdParamUpdate = cmd.CreateParameter(); itemIdParamUpdate.ParameterName = "@ItemId"; itemIdParamUpdate.Value = itemId; cmd.Parameters.Add(itemIdParamUpdate);
                var returnConditionParam = cmd.CreateParameter(); returnConditionParam.ParameterName = "@Status_Kondisi_Pengembalian"; returnConditionParam.Value = completeDto.Status_Kondisi_Pengembalian; cmd.Parameters.Add(returnConditionParam);
                int rowsAffectedItem = await cmd.ExecuteNonQueryAsync();

                if (rowsAffectedBooking > 0 && rowsAffectedItem > 0)
                {
                    return NoContent();
                }
                return StatusCode(500, new { message = "Failed to complete booking and update item status." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing booking request ID: {BookingId} by admin {AdminId}.", id, currentAdminId);
                return StatusCode(500, new { message = "An internal server error occurred while completing booking request." });
            }
        }

        /// <summary>
        /// Retrieves a paginated list of all booking history records for administrators.
        /// </summary>
        /// <param name="paginationParams">Pagination parameters.</param>
        /// <returns>A paginated list of all booking history records.</returns>
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookingHistory([FromQuery] PaginationParams paginationParams)
        {
            try
            {
                await using var conn = await _connectionService.GetDBConnectionAsync();
                await conn.OpenAsync();
                DbCommand cmd = conn.CreateCommand();
                int offset = (paginationParams.PageNumber - 1) * paginationParams.PageSize;

                // Re-check: COUNT(*) query for all bookings
                cmd.CommandText = "SELECT COUNT(*) FROM peminjaman;";
                long totalRecords = (long)await cmd.ExecuteScalarAsync();
                cmd.Parameters.Clear();

                // Re-check: SELECT for paged all booking history
                // ASSUMPTION: The 'peminjaman' table has 'Denda', 'Alasan_Penolakan', 'Tanggal_Pengajuan', 'Tanggal_Approval', 'Tanggal_Pengembalian_Aktual', 'id_Admin', 'id_Admin_Pengembalian' columns.
                cmd.CommandText = @"
                    SELECT
                        p.id_Peminjaman, p.Start_Date, p.End_Date, p.Deskripsi, p.Status_Peminjaman, p.Denda,
                        p.Alasan_Penolakan, p.Tanggal_Pengajuan, p.Tanggal_Approval, p.Tanggal_Pengembalian_Aktual,
                        p.id_Barang, b.Nama_Barang,
                        p.id_Peminjam, usr.Nama_Peminjam,
                        p.id_Admin, adm.Nama_Admin,
                        p.id_Admin_Pengembalian, adm_ret.Nama_Admin AS Nama_Admin_Pengembalian
                    FROM peminjaman p
                    JOIN barang b ON p.id_Barang = b.id_Barang
                    JOIN peminjam usr ON p.id_Peminjam = usr.id_Peminjam
                    LEFT JOIN admin adm ON p.id_Admin = adm.id_Admin
                    LEFT JOIN admin adm_ret ON p.id_Admin_Pengembalian = adm_ret.id_Admin
                    ORDER BY p.Tanggal_Pengajuan DESC
                    LIMIT @PageSize OFFSET @Offset;";

                var pageSizeParam = cmd.CreateParameter(); pageSizeParam.ParameterName = "@PageSize"; pageSizeParam.Value = paginationParams.PageSize; cmd.Parameters.Add(pageSizeParam);
                var offsetParam = cmd.CreateParameter(); offsetParam.ParameterName = "@Offset"; offsetParam.Value = offset; cmd.Parameters.Add(offsetParam);

                var history = new List<AdminBookingHistoryDto>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    history.Add(new AdminBookingHistoryDto
                    {
                        id_Peminjaman = reader.GetInt32(reader.GetOrdinal("id_Peminjaman")),
                        Start_Date = reader.GetDateTime(reader.GetOrdinal("Start_Date")),
                        End_Date = reader.GetDateTime(reader.GetOrdinal("End_Date")),
                        Deskripsi = reader.IsDBNull(reader.GetOrdinal("Deskripsi")) ? null : reader.GetString(reader.GetOrdinal("Deskripsi")),
                        Status_Peminjaman = reader.GetString(reader.GetOrdinal("Status_Peminjaman")),
                        Denda = reader.IsDBNull(reader.GetOrdinal("Denda")) ? (long?)null : reader.GetInt64(reader.GetOrdinal("Denda")),
                        Alasan_Penolakan = reader.IsDBNull(reader.GetOrdinal("Alasan_Penolakan")) ? null : reader.GetString(reader.GetOrdinal("Alasan_Penolakan")),
                        Tanggal_Pengajuan = reader.IsDBNull(reader.GetOrdinal("Tanggal_Pengajuan")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Pengajuan")),
                        Tanggal_Approval = reader.IsDBNull(reader.GetOrdinal("Tanggal_Approval")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Approval")),
                        Tanggal_Pengembalian_Aktual = reader.IsDBNull(reader.GetOrdinal("Tanggal_Pengembalian_Aktual")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("Tanggal_Pengembalian_Aktual")),
                        id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                        Nama_Barang = reader.GetString(reader.GetOrdinal("Nama_Barang")),
                        id_Peminjam = reader.GetInt32(reader.GetOrdinal("id_Peminjam")),
                        Nama_Peminjam = reader.GetString(reader.GetOrdinal("Nama_Peminjam")),
                        id_Admin = reader.IsDBNull(reader.GetOrdinal("id_Admin")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("id_Admin")),
                        Nama_Admin = reader.IsDBNull(reader.GetOrdinal("Nama_Admin")) ? null : reader.GetString(reader.GetOrdinal("Nama_Admin")),
                        id_Admin_Pengembalian = reader.IsDBNull(reader.GetOrdinal("id_Admin_Pengembalian")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("id_Admin_Pengembalian")),
                        Nama_Admin_Pengembalian = reader.IsDBNull(reader.GetOrdinal("Nama_Admin_Pengembalian")) ? null : reader.GetString(reader.GetOrdinal("Nama_Admin_Pengembalian"))
                    });
                }
                var paginatedResponse = new PaginatedResponse<AdminBookingHistoryDto>(history, paginationParams.PageNumber, paginationParams.PageSize, totalRecords);
                return Ok(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all booking history for admin.");
                return StatusCode(500, new { message = "An internal server error occurred while fetching all booking history." });
            }
        }
    }
}
