using SHIM.Server.Services.Interfaces;
using System.Data;
using System.Data.Common;

namespace SHIM.Server.Services.Class
{
    public class PeminjamanService : IPeminjamanService
    {
        private readonly IConfiguration _config;
        private readonly IConnectionService _connectionService;

        public PeminjamanService(IConfiguration configuration, IConnectionService connectionService)
        {
            _config = configuration;
            _connectionService = connectionService;
        }
        private void AddParameter(DbCommand command, string name, object value, DbType? dbType = null)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value ?? DBNull.Value; // Handle null values appropriately
            if (dbType.HasValue)
            {
                parameter.DbType = dbType.Value;
            }
            command.Parameters.Add(parameter);
        }
        public async Task AddPeminjamanAsync(Peminjaman peminjaman)
        {
            await using DbConnection connection = await _connectionService.GetDBConnectionAsync();
            await connection.OpenAsync();

            string query = @"INSERT INTO peminjaman (Start_Date, End_Date, Deskripsi, id_Peminjam, id_Barang, Status_Peminjaman) 
                            VALUES (@Start_Date, @End_Date, @Deskripsi, @id_Peminjam, @id_Barang, @Status_Peminjaman)";

            await using DbCommand command = connection.CreateCommand();
            command.CommandText = query;

            AddParameter(command, "@Start_Date", peminjaman.Start_Date, DbType.String);
            AddParameter(command, "@End_Date", peminjaman.End_Date, DbType.String);
            AddParameter(command, "@Deskripsi", peminjaman.Deskripsi, DbType.String);
            AddParameter(command, "@id_Peminjam", peminjaman.id_Peminjam, DbType.Int32);
            AddParameter(command, "@id_Barang", peminjaman.id_Barang, DbType.Int32);
            AddParameter(command, "@Status_Peminjaman", "Pending", DbType.String);

            try
            {
                await command.ExecuteNonQueryAsync();
            }
            catch (DbException ex)
            {
                // Log exception (ex)
                throw new Exception("An error occurred while adding the Peminjam.", ex);
            }
        }

        public async Task<IEnumerable<Peminjaman>> GetAllPeminjamanAsync()
        {
            var peminjamanList = new List<Peminjaman>();
            await using DbConnection connection = await _connectionService.GetDBConnectionAsync();
            await connection.OpenAsync();

            string query = @"SELECT pn.id_Peminjaman, pn.Start_Date, pn.End_Date, pn.Deskripsi, 
                             p.id_Peminjam, p.Nama_Peminjam, b.id_Barang,b.Nama_Barang, pn.Status_Peminjaman
                                FROM peminjaman pn ,peminjam p,barang b";
            await using DbCommand command = connection.CreateCommand();
            command.CommandText = query;

            await using DbDataReader dataReader = await command.ExecuteReaderAsync();
            while (await dataReader.ReadAsync())
            {
                var peminjaman = new Peminjaman
                {
                    id_Peminjaman = dataReader.GetInt32(dataReader.GetOrdinal("id_Peminjaman")),
                    Start_Date = dataReader.GetString(dataReader.GetOrdinal("Start_Date")),
                    End_Date = dataReader.GetString(dataReader.GetOrdinal("End_Date")),
                    Denda = dataReader.GetInt64(dataReader.GetOrdinal("Denda")),
                    Deskripsi = dataReader.GetString(dataReader.GetOrdinal("Deskripsi")),
                    id_Admin = dataReader.GetInt32(dataReader.GetOrdinal("id_Admin")),
                    id_Peminjam = dataReader.GetInt32(dataReader.GetOrdinal("id_Peminjam")),
                    id_Barang = dataReader.GetInt32(dataReader.GetOrdinal("id_Barang")),
                    Status_Peminjaman = dataReader.GetString(dataReader.GetOrdinal("Status_Peminjaman"))

                };
                peminjamanList.Add(peminjaman);
            }
            return peminjamanList;
        }

        public async Task<Peminjaman> GetPeminjamanByStatusAsync(string Status_Peminjaman)
        {
            await using DbConnection connection = await _connectionService.GetDBConnectionAsync();
            await connection.OpenAsync();

            string query = @"SELECT pn.id_Peminjaman, pn.Start_Date, pn.End_Date, pn.Deskripsi, 
                             p.id_Peminjam, p.Nama_Peminjam, b.id_Barang,b.Nama_Barang, pn.Status_Peminjaman
                                FROM peminjaman pn ,peminjam p,barang b
                                WHERE Status_Peminjaman = @Status_Peminjaman";

            await using DbCommand command = connection.CreateCommand();
            command.CommandText = query;

            AddParameter(command, "@Status_Peminjaman", "Pending", DbType.String);
            await using DbDataReader reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync()) {
                return new Peminjaman
                {
                    id_Peminjaman = reader.GetInt32(reader.GetOrdinal("id_Peminjaman")),
                    Start_Date = reader.GetString(reader.GetOrdinal("Start_Date")),
                    End_Date = reader.GetString(reader.GetOrdinal("End_Date")),
                    Deskripsi = reader.GetString(reader.GetOrdinal("Deskripsi")),
                    id_Peminjam = reader.GetInt32(reader.GetOrdinal("id_Peminjam")),
                    id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                    Status_Peminjaman = reader.GetString(reader.GetOrdinal("Status_Peminjaman"))
                };
            }
            else
            {
                return null;
            }
        }

        public async Task<Peminjaman> GetPeminjamanByUserAsync(int id_Peminjam)
        {
            await using DbConnection connection = await _connectionService.GetDBConnectionAsync();
            await connection.OpenAsync();

            string query = @"SELECT pn.Start_Date, pn.End_Date, pn.Deskripsi, 
                             p.Nama_Peminjam, b.Nama_Barang, pn.Status_Peminjaman
                                FROM peminjaman pn ,peminjam p,barang b
                                WHERE id_Peminjam = @id_Peminjam";

            await using DbCommand command = connection.CreateCommand();
            command.CommandText = query;

            AddParameter(command, "@Status_Peminjaman", "Pending", DbType.String);
            await using DbDataReader reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Peminjaman
                {
                    id_Peminjaman = reader.GetInt32(reader.GetOrdinal("id_Peminjaman")),
                    Start_Date = reader.GetString(reader.GetOrdinal("Start_Date")),
                    End_Date = reader.GetString(reader.GetOrdinal("End_Date")),
                    Deskripsi = reader.GetString(reader.GetOrdinal("Deskripsi")),
                    id_Peminjam = reader.GetInt32(reader.GetOrdinal("id_Peminjam")),
                    id_Barang = reader.GetInt32(reader.GetOrdinal("id_Barang")),
                    Status_Peminjaman = reader.GetString(reader.GetOrdinal("Status_Peminjaman"))
                };
            }
            else
            {
                return null;
            }
        }

        public async Task UpdatePeminjamanStatusAsync(string Status_Peminjaman)
        {
            await using DbConnection connection = await _connectionService.GetDBConnectionAsync();
            await connection.OpenAsync();

            string query = @"UPDATE peminjaman SET Status_Peminjaman = @Status_Peminjaman 
                                WHERE id_Peminjaman = @id_Peminjaman";

            await using DbCommand command = connection.CreateCommand();
            command.CommandText = query;

            AddParameter(command, "@Status_Peminjaman", Status_Peminjaman, DbType.String);

        }

        public Task UpdatePeminjamanStartDate(string Start_Date)
        {
            throw new NotImplementedException();
        }

        public Task UpdatePeminjamanEndDate(string End_Date)
        {
            throw new NotImplementedException();
        }

        public Task UpdatePeminjamanDeskripsi(string Deskripsi)
        {
            throw new NotImplementedException();
        }
    }
}

