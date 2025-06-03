namespace SHIM.Server.Services.Interfaces
{
    public interface IPeminjamanService
    {
        Task<IEnumerable<Peminjaman>> GetAllPeminjamanAsync();

        Task<Peminjaman> GetPeminjamanByStatusAsync(string Status_Peminjaman);
        Task<Peminjaman> GetPeminjamanByUserAsync(int id_Peminjam);

        Task AddPeminjamanAsync (Peminjaman peminjaman);

        Task UpdatePeminjamanStartDate(string Start_Date);
        Task UpdatePeminjamanEndDate(string End_Date);
        Task UpdatePeminjamanDeskripsi(string Deskripsi);
        Task UpdatePeminjamanStatusAsync (string Status_Peminjaman);
    }
}
