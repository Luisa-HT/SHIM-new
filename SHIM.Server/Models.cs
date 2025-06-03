using System.Numerics;

namespace SHIM.Server
{
    public class Admin
    {
        public int id_Admin {  get; set; }
        public string Nama_Admin { get; set; }
        public string No_Telp { get; set; }
        public string Email { get; set;}
    }

    public class Barang 
    { 
        public int id_Barang { get; set; }
        public string Nama_Barang { get;set; }
        public string Deskripsi_Barang { get; set; }
        public string Status_Kondisi { get; set; }
        public string Tanggal_Perolehan { get; set; }
        public string Status_Barang { get; set; }
        public BigInteger Harga_Barang { get; set; }
        public int id_Hibah { get; set; }
    }
    public class Hibah
    {
        public int id_Hibah { get; set; }
        public string Nama_Hibah { get; set; }
        public string Keterangan {  get; set; }
        public short Tahun {  get; set; }
        public string Penanggung_Jawab {  get; set; }
    }

    public class Peminjam
    {
        public int id_Peminjam { get; set; }
        public string Nama_Peminjam { get; set; }
        public string Email { get; set; }
        public string No_Telp {  get; set; }
        public string Alamat { get; set; }
    }
    public class Peminjaman
    {
        public int id_Peminjaman { get; set ; }
        public string Start_Date { get; set; }
        public string End_Date { get; set; }
        public BigInteger Denda { get; set;}
        public string Deskripsi { get; set; }
        public int id_Peminjam { get; set; }
        public int id_Barang { get; set; }
        public int id_Admin { get; set; }
        public string Status_Peminjaman { get; set; }

    }
}
