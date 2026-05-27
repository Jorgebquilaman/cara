using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly ApplicationDbContext _context;

    public PasswordResetTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
        => await _context.PasswordResetTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.Token == token, cancellationToken);

    public void Add(PasswordResetToken resetToken) => _context.PasswordResetTokens.Add(resetToken);
    public void Update(PasswordResetToken resetToken) => _context.PasswordResetTokens.Update(resetToken);
}
