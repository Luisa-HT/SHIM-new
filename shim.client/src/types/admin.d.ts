// ClientApp/src/types/admin.d.ts

export interface AdminProfileDto {
    id_Admin: number;
    nama_Admin: string;
    email: string;
    no_Telp?: string;
    // Fields like 'Status', 'Institute', 'Studies' from design are NOT in DB schema and thus not in this DTO.
}

export interface UpdateAdminProfileDto {
    nama_Admin?: string;
    no_Telp?: string;
    // Fields like 'Status', 'Institute', 'Studies' from design are NOT in DB schema and thus not in this DTO.
}
