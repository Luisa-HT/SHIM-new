namespace SHIM.Server.Services.Interfaces
{
    public interface IPeminjamService
    {
        Task<IEnumerable<Peminjam>> GetPeminjamListAsync();

        Task<Peminjam> GetPeminjamByidAsync(int id_Peminjam);
        Task AddPeminjamAsync  (Peminjam peminjam);
        Task DeletePeminjamAsync (int id_Peminjam);
        Task UpdatePeminjamAsync(Peminjam peminjam);
        Task UpdateNamaPeminjamAsync(string Nama_Peminjam);
        Task UpdateEmailPeminjamAsync(string Email);
        Task UpdateTelpPeminjamAsync(string No_Telp);
        Task UpdateAlamatPeminjamAsync(string Alamat);
    }
}