namespace SHIM.Server.Services.Interfaces
{
    public interface ITokenService
    {
        /// <summary>
        /// Generates a JWT token for the given user/admin details.
        /// </summary>
        /// <param name="userId">The unique identifier of the user or admin.</param>
        /// <param name="name">The name of the user or admin.</param>
        /// <param name="email">The email of the user or admin.</param>
        /// <param name="role">The role of the user ("User" or "Admin").</param>
        /// <returns>A string representing the JWT token.</returns>
        string GenerateToken(string userId, string name, string email, string role);
    }
}