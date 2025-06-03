namespace SHIM.Server.Services.Interfaces
{
    public interface IAdminService
    {
        Task AddAdminAsync(Admin admin);
        Task DeleteAdminAsync(int id_Admin);
        Task UpdateAdminAsync(Admin admin);
        Task UpdateNamaAdminAsync(string Nama_Admin);
        Task UpdateTelpAdminAsync(string No_Telp);
        Task UpdateEmailAdminAsync(string Email);
    }
}
