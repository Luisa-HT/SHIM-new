// ClientApp/src/types/grant.d.ts

export interface HibahDto {
    id_Hibah: number;
    nama_Hibah: string;
    keterangan?: string;
    tahun?: number; // smallint in C# maps to number | undefined
    penanggung_Jawab?: string;
}

export interface CreateHibahDto {
    nama_Hibah: string;
    keterangan?: string;
    tahun?: number;
    penanggung_Jawab?: string;
}

export interface UpdateHibahDto extends CreateHibahDto {
    nama_Hibah: string;
    keterangan?: string;
    tahun?: number;
    penanggung_Jawab?: string;
    // Can extend CreateHibahDto
}
