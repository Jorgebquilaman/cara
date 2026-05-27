using Domain.Entities;

namespace Domain.Interfaces;

public interface IPasswordResetTokenRepository
{
    Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    void Add(PasswordResetToken resetToken);
    void Update(PasswordResetToken resetToken);
}
