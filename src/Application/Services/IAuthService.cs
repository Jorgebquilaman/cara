using Application.DTOs;
using Domain.Entities;

namespace Application.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto login, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterAsync(CreateUserDto registration, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);
    string GenerateJwtToken(User user);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}
