// YourAspNetCoreProject/Services/Interfaces/IConnectionService.cs
using System.Data.Common;
using System.Threading.Tasks;

namespace SHIM.Server.Services.Interfaces
{
    public interface IConnectionService
    {
        /// <summary>
        /// Asynchronously gets a database connection.
        /// The specific DbConnection type (e.g., MySqlConnection) will depend on the implementation.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation, containing the DbConnection.</returns>
        Task<DbConnection> GetDBConnectionAsync();
    }
}