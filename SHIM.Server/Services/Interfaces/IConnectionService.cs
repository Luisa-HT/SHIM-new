using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data.Common;
using Microsoft.Extensions.Configuration;
namespace SHIM.Server.Services.Interfaces
{
    public interface IConnectionService
    {
        Task<DbConnection> GetDBConnectionAsync();
    }
}
