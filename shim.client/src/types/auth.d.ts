// ClientApp/src/types/auth.d.ts

export interface LoginRequestDto {
    email?: string;
    password?: string;
}

export interface LoginResponseDto {
    token: string;
    userId: string; // Corresponds to id_Peminjam or id_Admin as string
    name: string;   // Corresponds to Nama_Peminjam or Nama_Admin
    email: string;
    role: 'User' | 'Admin'; // Explicitly define roles
}

export interface SignUpRequestDto {
    nama_Peminjam?: string;
    email?: string;
    no_Telp?: string; // Corresponds to No_Telp from peminjam table
    alamat?: string; // Corresponds to Alamat from peminjam table
    // Fields like 'Studies', 'Status', 'Institute' from design are NOT in DB schema and thus not in this DTO.
    password?: string;
}
