// ClientApp/src/types/user.d.ts

export interface UserProfileDto {
    id_Peminjam: number;
    nama_Peminjam: string;
    email: string;
    no_Telp?: string;
    alamat?: string;
    // Fields like 'Status', 'Institute', 'Studies' from design are NOT in DB schema and thus not in this DTO.
}

export interface UpdateUserProfileDto {
    nama_Peminjam?: string;
    no_Telp?: string;
    alamat?: string;
    // Fields like 'Status', 'Institute', 'Studies' from design are NOT in DB schema and thus not in this DTO.
}

export interface UpdateEmailDto {
    newEmail?: string;
}

export interface UpdatePasswordDto {
    currentPassword?: string;
    newPassword?: string;
}
