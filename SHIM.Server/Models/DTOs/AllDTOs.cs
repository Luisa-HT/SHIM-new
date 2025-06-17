// YourAspNetCoreProject/Models/DTOs/AllDTOs.cs
// All Data Transfer Objects (DTOs) for the SHIM application.
// Strictly adheres to the provided database schema, with 'Password' column storing the hash.

using System;
using System.ComponentModel.DataAnnotations; // For validation attributes
using System.Collections.Generic; // For IEnumerable in PaginatedResponse

namespace SHIM.Server.Models.DTOs
{
    // --- Auth DTOs ---
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; }
    }

    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string UserId { get; set; } // Corresponds to id_Peminjam or id_Admin as string
        public string Name { get; set; }   // Corresponds to Nama_Peminjam or Nama_Admin
        public string Email { get; set; }
        public string Role { get; set; } // "User" or "Admin"
    }

    public class SignUpRequestDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Nama_Peminjam { get; set; } // Corresponds to Nama_Peminjam: varchar(100)

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } // Corresponds to Email: varchar(254)

        // 'Field E' from design maps to 'No_Telp' from peminjam table schema
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(13, ErrorMessage = "Phone number cannot exceed 13 characters.")]
        public string No_Telp { get; set; } // Corresponds to No_Telp: varchar(13)

        // 'Field F' from design maps to 'Alamat' from peminjam table schema
        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string Alamat { get; set; } // Corresponds to Alamat: varchar(500)

        // 'Field G' from design (and 'Status', 'Institute', 'Studies' from profile designs)
        // are NOT present in the peminjam table schema and thus CANNOT be included in this DTO.

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } // This maps to the Password column storing the hash
    }

    // --- User Profile DTOs ---
    public class UserProfileDto
    {
        public int id_Peminjam { get; set; } // Corresponds to id_Peminjam: int(11)
        public string Nama_Peminjam { get; set; } // Corresponds to Nama_Peminjam: varchar(100)
        public string Email { get; set; } // Corresponds to Email: varchar(254)
        public string No_Telp { get; set; } // Corresponds to No_Telp: varchar(13)
        public string Alamat { get; set; } // Corresponds to Alamat: varchar(500)

        // Fields like Status, Institute, Studies from User Account design are NOT present
        // in the peminjam table schema and thus CANNOT be in this backend DTO.
    }

    public class UpdateUserProfileDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Nama_Peminjam { get; set; } // Corresponds to Nama_Peminjam

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(13, ErrorMessage = "Phone number cannot exceed 13 characters.")]
        public string No_Telp { get; set; } // Corresponds to No_Telp

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters.")]
        public string Alamat { get; set; } // Corresponds to Alamat

        // Fields like Status, Institute, Studies from User Account design are NOT present
        // in the peminjam table schema and thus CANNOT be in this backend DTO.
    }

    public class UpdateEmailDto
    {
        [Required(ErrorMessage = "New email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string NewEmail { get; set; }
    }

    public class UpdatePasswordDto
    {
        [Required(ErrorMessage = "Current password is required.")]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "New password is required.")]
        [MinLength(6, ErrorMessage = "New password must be at least 6 characters long.")]
        public string NewPassword { get; set; }
    }


    // --- Admin Profile DTOs ---
    public class AdminProfileDto
    {
        public int id_Admin { get; set; } // Corresponds to id_Admin: int(11)
        public string Nama_Admin { get; set; } // Corresponds to Nama_Admin: varchar(100)
        public string Email { get; set; } // Corresponds to Email: varchar(254)
        public string No_Telp { get; set; } // Corresponds to No_Telp: varchar(13)

        // Fields like Status, Institute, Studies from Admin Account design are NOT present
        // in the admin table schema and thus CANNOT be in this backend DTO.
    }

    public class UpdateAdminProfileDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Nama_Admin { get; set; } // Corresponds to Nama_Admin

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(13, ErrorMessage = "Phone number cannot exceed 13 characters.")]
        public string No_Telp { get; set; } // Corresponds to No_Telp

        // Fields like Status, Institute, Studies from Admin Account design are NOT present
        // in the admin table schema and thus CANNOT be in this backend DTO.
    }


    // --- Inventory (Barang) DTOs ---
    public class BarangDto // For listing and details
    {
        public int id_Barang { get; set; } // Corresponds to id_Barang: int(11)
        public string Nama_Barang { get; set; } // Corresponds to Nama_Barang: varchar(100)
        public string Deskripsi_Barang { get; set; } // Corresponds to Deskripsi_Barang: varchar(100)
        public string Status_Kondisi { get; set; } // Corresponds to Status_Kondisi: varchar(50)
        public string Status_Barang { get; set; } // Corresponds to Status_Barang: varchar(50)
        public DateTime Tanggal_Perolehan { get; set; } // Corresponds to Tanggal_Perolehan: date
        public long? Harga_Barang { get; set; } // Corresponds to Harga_Barang: bigint(20) - Nullable
        public int? id_Hibah { get; set; } // Corresponds to id_Hibah: int(11) - Nullable
        public string Nama_Hibah { get; set; } // ADDED: For display purposes, derived from join with hibah table
        public DateTime? Latest_Booking_Date { get; set; } // For the subquery example
    }

    public class CreateBarangDto
    {
        [Required(ErrorMessage = "Item name is required.")]
        [StringLength(100, ErrorMessage = "Item name cannot exceed 100 characters.")]
        public string Nama_Barang { get; set; }

        [StringLength(100, ErrorMessage = "Description cannot exceed 100 characters.")]
        public string Deskripsi_Barang { get; set; }

        [StringLength(50, ErrorMessage = "Condition status cannot exceed 50 characters.")]
        public string Status_Kondisi { get; set; }

        [Required(ErrorMessage = "Acquisition date is required.")]
        public DateTime Tanggal_Perolehan { get; set; }

        [Required(ErrorMessage = "Item status is required.")]
        [StringLength(50, ErrorMessage = "Item status cannot exceed 50 characters.")]
        public string Status_Barang { get; set; }

        [Range(0, long.MaxValue, ErrorMessage = "Price must be a positive number.")]
        public long? Harga_Barang { get; set; }

        public int? id_Hibah { get; set; } // Corresponds to id_Hibah: int(11) - Nullable
    }

    public class UpdateBarangDto : CreateBarangDto
    {
        // No additional properties needed for update, inherits from CreateBarangDto
    }

    public class UpdateBarangStatusDto
    {
        [Required(ErrorMessage = "Status Barang is required.")]
        [StringLength(50, ErrorMessage = "Status Barang cannot exceed 50 characters.")]
        public string Status_Barang { get; set; }
    }

    // --- Booking (Peminjaman) DTOs ---
    public class CreateBookingRequestDto
    {
        [Required(ErrorMessage = "Start date is required.")]
        public DateTime Start_Date { get; set; } // Corresponds to Start_Date: datetime

        [Required(ErrorMessage = "End date is required.")]
        public DateTime End_Date { get; set; } // Corresponds to End_Date: datetime

        [StringLength(300, ErrorMessage = "Description cannot exceed 300 characters.")]
        public string Deskripsi { get; set; } // Corresponds to Deskripsi: varchar(300)

        [Required(ErrorMessage = "Item ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Invalid Item ID.")]
        public int id_Barang { get; set; } // Corresponds to id_Barang: int(11)
    }

    public class BookingHistoryDto // For user's history
    {
        public int id_Peminjaman { get; set; } // Corresponds to id_Peminjaman: int(11)
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Deskripsi { get; set; }
        public string Status_Peminjaman { get; set; } // Corresponds to Status_Peminjaman: varchar(20)
        public string Nama_Barang { get; set; } // From joined barang table
        public long? Denda { get; set; } // Corresponds to Denda: bigint(20)
        // These fields are common for booking history but not explicitly in peminjaman table diagram
        // Assuming they are either added to DB or derived from other tables/logic.
        public string Alasan_Penolakan { get; set; }
        public DateTime? Tanggal_Pengajuan { get; set; }
        public DateTime? Tanggal_Approval { get; set; }
        public DateTime? Tanggal_Pengembalian_Aktual { get; set; }
    }

    public class AdminBookingRequestDto // For admin viewing pending requests
    {
        public int id_Peminjaman { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Deskripsi { get; set; }
        public string Status_Peminjaman { get; set; }
        public string Nama_Barang { get; set; }
        public int id_Barang { get; set; }
        public string Nama_Peminjam { get; set; } // From joined peminjam table
        public int id_Peminjam { get; set; } // From joined peminjam table
        public string Peminjam_Email { get; set; } // From joined peminjam table
        public string Peminjam_No_Telp { get; set; } // From joined peminjam table
        public DateTime? Tanggal_Pengajuan { get; set; } // Implicitly added
    }

    public class AdminBookingHistoryDto // For admin viewing all history
    {
        public int id_Peminjaman { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Deskripsi { get; set; }
        public string Status_Peminjaman { get; set; }
        public string Nama_Barang { get; set; }
        public int id_Barang { get; set; }
        public string Nama_Peminjam { get; set; }
        public int id_Peminjam { get; set; }
        public string Nama_Admin { get; set; } // From joined admin table
        public int? id_Admin { get; set; } // From joined admin table
        public string Nama_Admin_Pengembalian { get; set; } // Assumes a relationship/logic for who processed return
        public int? id_Admin_Pengembalian { get; set; } // Assumes a relationship/logic for who processed return
        public long? Denda { get; set; }
        public string Alasan_Penolakan { get; set; } // Implicitly added
        public DateTime? Tanggal_Pengajuan { get; set; } // Implicitly added
        public DateTime? Tanggal_Approval { get; set; } // Implicitly added
        public DateTime? Tanggal_Pengembalian_Aktual { get; set; } // Implicitly added
    }

    public class AdminDashboardStatsDto
    {
        public int PendingCount { get; set; }
        public int TodaysBookingsCount { get; set; }
    }

    public class DeclineBookingDto
    {
        [Required(ErrorMessage = "Reason for decline is required.")]
        [StringLength(200, ErrorMessage = "Reason cannot exceed 200 characters.")]
        public string Alasan_Penolakan { get; set; }
    }

    public class CompleteBookingDto
    {
        [Range(0, long.MaxValue, ErrorMessage = "Fine must be a positive number.")]
        public long? Denda { get; set; }

        [Required(ErrorMessage = "Return condition status is required.")]
        [StringLength(50, ErrorMessage = "Return condition status cannot exceed 50 characters.")]
        public string Status_Kondisi_Pengembalian { get; set; } // e.g., "Good", "Damaged"
    }


    // --- Grant (Hibah) DTOs ---
    public class HibahDto
    {
        public int id_Hibah { get; set; } // Corresponds to id_Hibah: int(11)
        public string Nama_Hibah { get; set; } // Corresponds to Nama_Hibah: varchar(50)
        public string Keterangan { get; set; } // Corresponds to Keterangan: varchar(200)
        public short? Tahun { get; set; } // Corresponds to Tahun: smallint(6)
        public string Penanggung_Jawab { get; set; } // Corresponds to Penanggung_Jawab: varchar(50)
    }

    public class CreateHibahDto
    {
        [Required(ErrorMessage = "Grant name is required.")]
        [StringLength(50, ErrorMessage = "Grant name cannot exceed 50 characters.")]
        public string Nama_Hibah { get; set; }

        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters.")]
        public string Keterangan { get; set; }

        [Range(1900, 3000, ErrorMessage = "Year must be between 1900 and 3000.")] // Arbitrary year range
        public short? Tahun { get; set; }

        [StringLength(50, ErrorMessage = "Responsible person name cannot exceed 50 characters.")]
        public string Penanggung_Jawab { get; set; }
    }

    public class UpdateHibahDto : CreateHibahDto
    {
        // No additional properties needed for update, inherits from CreateHibahDto
    }

    // --- Pagination DTO ---
    public class PaginationParams
    {
        private const int MaxPageSize = 50;
        private int _pageNumber = 1;
        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = (value < 1) ? 1 : value;
        }

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : (value < 1) ? 10 : value;
        }
    }

    // Generic response for paginated data.
    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Items { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public long TotalRecords { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalRecords / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;

        public PaginatedResponse(IEnumerable<T> items, int pageNumber, int pageSize, long totalRecords)
        {
            Items = items;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalRecords = totalRecords;
        }
    }
}
