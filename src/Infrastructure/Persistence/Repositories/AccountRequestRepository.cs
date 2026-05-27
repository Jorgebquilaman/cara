using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class AccountRequestRepository : IAccountRequestRepository
{
    private readonly ApplicationDbContext _context;

    public AccountRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AccountRequest>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.AccountRequests.OrderByDescending(r => r.RequestedAt).ToListAsync(cancellationToken);

    public async Task<AccountRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.AccountRequests.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public void Add(AccountRequest request) => _context.AccountRequests.Add(request);
    public void Update(AccountRequest request) => _context.AccountRequests.Update(request);
}
