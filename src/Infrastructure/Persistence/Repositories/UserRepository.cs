using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Users
            .Include(u => u.Career).ThenInclude(c => c.Department)
            .Include(u => u.Sanctions.Where(s => s.IsActive))
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var users = await _context.Users
            .Include(u => u.Career).ThenInclude(c => c.Department)
            .Include(u => u.Sanctions.Where(s => s.IsActive))
            .ToListAsync(cancellationToken);

        return users.FirstOrDefault(u =>
            u.InstitutionalEmail.Value.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Users
            .Include(u => u.Career).ThenInclude(c => c.Department)
            .Include(u => u.Sanctions.Where(s => s.IsActive))
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<User>> GetByRoleAsync(string role, CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.ToListAsync(cancellationToken);
        return users.Where(u => u.Role.ToString() == role)
            .OrderBy(u => u.LastName)
            .ToList();
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.ToListAsync(cancellationToken);
        return users.Any(u =>
            u.InstitutionalEmail.Value.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    public void Add(User user) => _context.Users.Add(user);
    public void Update(User user) => _context.Users.Update(user);
}
