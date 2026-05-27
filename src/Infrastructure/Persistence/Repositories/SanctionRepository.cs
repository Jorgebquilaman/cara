using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class SanctionRepository : ISanctionRepository
{
    private readonly ApplicationDbContext _context;

    public SanctionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Sanction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Sanctions.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Sanction>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Sanctions.Include(s => s.User).OrderByDescending(s => s.IssuedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Sanction>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        => await _context.Sanctions.Include(s => s.User).Where(s => s.IsActive && s.ExpiresAt > DateTime.UtcNow).OrderByDescending(s => s.IssuedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Sanction>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Sanctions.Include(s => s.User)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.IssuedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Sanction>> GetActiveByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Sanctions.Include(s => s.User)
            .Where(s => s.UserId == userId && s.IsActive && s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.IssuedAt)
            .ToListAsync(cancellationToken);

    public async Task<bool> UserHasActiveSanctionsAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Sanctions.AnyAsync(s => s.UserId == userId && s.IsActive && s.ExpiresAt > DateTime.UtcNow, cancellationToken);

    public void Add(Sanction sanction) => _context.Sanctions.Add(sanction);
    public void Update(Sanction sanction) => _context.Sanctions.Update(sanction);
}
