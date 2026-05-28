using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class IncidentRepository : IIncidentRepository
{
    private readonly ApplicationDbContext _context;

    public IncidentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Incident>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Incidents
            .Include(i => i.Loan)
            .ThenInclude(l => l.Asset)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync(cancellationToken);

    public async Task<Incident?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Incidents.FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Incident>> GetByLoanAsync(Guid loanId, CancellationToken cancellationToken = default)
        => await _context.Incidents
            .Where(i => i.LoanId == loanId)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Incident>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Incidents
            .Where(i => i.Loan.UserId == userId)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync(cancellationToken);

    public async Task<bool> HasUnresolvedIncidentsAsync(Guid assetId, CancellationToken cancellationToken = default)
        => await _context.Incidents
            .AnyAsync(i => i.Loan.AssetId == assetId && !i.IsResolved, cancellationToken);

    public void Add(Incident incident) => _context.Incidents.Add(incident);
    public void Update(Incident incident) => _context.Incidents.Update(incident);
}
