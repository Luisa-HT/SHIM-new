namespace SHIM.Server.Services.Interfaces
{
    public interface IHibah
    {
        Task AddHibahAsync (Hibah hibah);
        Task DeleteHibahAsync (int id_Hibah);
        Task UpdateHibahAsync(Hibah hibah);
        Task UpdateNamaHibahAsync(string Nama_Hibah);

        Task UpdateKeteranganHibahAsync(string Keterangan);

        Task UpdateTahunHibahAsync(string Tahun);

        Task UpdatePenanggungJawabHibahAsync(string Penanggung_Jawab);
    }
}
