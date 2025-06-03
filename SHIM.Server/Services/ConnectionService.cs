using MySqlConnector;
using SHIM.Server.Services.Interfaces;
using System.Data.Common;

namespace SHIM.Server.Services
{
    public class ConnectionService : IConnectionService
    {
        private readonly IConfiguration _configuration;
        private DbConnection _connection;
        private ILogger<ConnectionService> _logger;
        // Constructor to inject IConfiguration
        public ConnectionService(IConfiguration configuration, ILogger<ConnectionService> logger)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            _connection = new MySqlConnection(connectionString);
            logger.LogInformation("Connection state: " + _connection.State);    
        }
        public Task<DbConnection> GetDBConnectionAsync()
        {
            return Task.FromResult(_connection);

        }
    }
}
