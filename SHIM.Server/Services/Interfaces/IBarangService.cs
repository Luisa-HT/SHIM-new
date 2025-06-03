using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SHIM.Server.Services.Interfaces
{
    public interface IBarangService
    {
        Task<IEnumerable<Barang>> GetBarangAsync();
        Task<Barang> GetBarangByStatusAsync(string status_barang);

        Task AddBarangAsync(Barang barang);
        Task UpdateStatusBarangAsync(string status_barang);
        Task UpdateKondisiBarangAsync(string status_kondisi);
        Task UpdateBarangAsync(Barang barang);

        Task UpdateNamaBarangAsync(string Nama_Barang);
        Task UpdateDeskripsiBarangAsync(string Deskripsi_Barang);
        Task UpdateTanggalBarangAsync(string Tanggal_Perolehan);
        Task UpdateHargaBarangAsync(BigInt Harga_Barang);
        Task UpdateHibahBarangAsync(int id_Hibah);

        Task DeleteBarangAsync(int id_Barang);
    }
}
