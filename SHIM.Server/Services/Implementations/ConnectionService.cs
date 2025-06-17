// YourAspNetCoreProject/Services/Implementations/ConnectionService.cs
using MySqlConnector; // Correct using statement for MySqlConnector
using SHIM.Server.Services.Interfaces;
using System.Data.Common;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration; // Required for IConfiguration
using Microsoft.Extensions.Logging; // Required for ILogger
using System; // Required for ArgumentNullException

namespace SHIM.Server.Services.Implementations
{
    public class ConnectionService : IConnectionService
    {
        private readonly string _connectionString;
        private readonly ILogger<ConnectionService> _logger; // Keep logger for diagnostics

        // Constructor to inject IConfiguration and ILogger
        public ConnectionService(IConfiguration configuration, ILogger<ConnectionService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(_connectionString))
            {
                _logger.LogError("DefaultConnection connection string is missing or empty.");
                throw new InvalidOperationException("DefaultConnection connection string is not configured.");
            }
            // Do NOT open connection here in constructor.
            // Connection state logging here is not useful as connection is not open yet.
        }

        /// <summary>
        /// Provides a new MySqlConnector database connection instance.
        /// The caller is responsible for opening and disposing this connection.
        /// </summary>
        /// <returns>A new MySqlConnection object.</returns>
        public Task<DbConnection> GetDBConnectionAsync()
        {
            // Create a NEW connection instance for each call.
            // This allows MySqlConnector's connection pooling to work correctly.
            var connection = new MySqlConnection(_connectionString);
            _logger.LogDebug("Created new MySqlConnection instance."); // Log for debugging if needed
            return Task.FromResult<DbConnection>(connection);
        }
    }
}