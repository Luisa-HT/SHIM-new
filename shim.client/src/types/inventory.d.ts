// ClientApp/src/types/inventory.d.ts

export interface BarangDto {
    id_Barang: number;
    nama_Barang: string;
    deskripsi_Barang?: string;
    status_Kondisi?: string; // e.g., "Good", "Damaged"
    status_Barang: string;   // e.g., "Available", "Booked", "Maintenance", "Tersedia"
    tanggal_Perolehan: string; // Date represented as string (ISO 8601)
    harga_Barang?: number;    // long? in C# maps to number | undefined
    id_Hibah?: number;        // Foreign key to hibah table
    nama_Hibah?: string;      // ADDED: For display purposes, derived from join with hibah table
    latest_Booking_Date?: string; // DateTime? in C# maps to string | undefined
}

export interface CreateBarangDto {
    nama_Barang: string;
    deskripsi_Barang?: string;
    status_Kondisi?: string;
    tanggal_Perolehan: string; // Date represented as string (ISO 8601)
    status_Barang: string;
    harga_Barang?: number;
    id_Hibah?: number; // int? in C# maps to number | undefined
}

export interface UpdateBarangDto extends CreateBarangDto {
    nama_Barang: string;
    deskripsi_Barang?: string;
    status_Kondisi?: string;
    tanggal_Perolehan: string; // Date represented as string (ISO 8601)
    status_Barang: string;
    harga_Barang?: number;
    id_Hibah?: number;
    // Can extend CreateBarangDto as properties are mostly the same for update
}

export interface UpdateBarangStatusDto {
    status_Barang: string;
}
