using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.DTOs;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto login, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(login.Email, cancellationToken);
        if (user == null)
            throw new UnauthorizedAccessException($"Invalid credentials. User not found for email: {login.Email}");

        if (!VerifyPassword(login.Password, user.PasswordHash))
            throw new UnauthorizedAccessException($"Invalid credentials. Password mismatch for email: {login.Email}");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                InstitutionalEmail = user.InstitutionalEmail,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                HasActiveSanctions = user.HasActiveSanctions,
                ActiveLoanCount = user.ActiveLoanCount,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(CreateUserDto registration, CancellationToken cancellationToken = default)
    {
        var exists = await _userRepository.ExistsByEmailAsync(registration.InstitutionalEmail, cancellationToken);
        if (exists)
            throw new InvalidOperationException("Email already registered.");

        var role = Enum.Parse<Domain.Enums.UserRole>(registration.Role);
        var email = new Domain.ValueObjects.Email(registration.InstitutionalEmail);
        var passwordHash = HashPassword(registration.Password);

        var user = new User(registration.FirstName, registration.LastName, email, role, passwordHash);
        _userRepository.Add(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                InstitutionalEmail = user.InstitutionalEmail,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        if (!VerifyPassword(currentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        var newHash = HashPassword(newPassword);
        user.SetPassword(newHash);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.InstitutionalEmail.Value),
            new Claim(ClaimTypes.Email, user.InstitutionalEmail.Value),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("fullName", $"{user.FirstName} {user.LastName}")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string HashPassword(string password)
        => BCrypt.Net.BCrypt.HashPassword(password);

    public bool VerifyPassword(string password, string hash)
        => BCrypt.Net.BCrypt.Verify(password, hash);
}
