using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class LoanRepository : ILoanRepository
{
    private readonly ApplicationDbContext _context;

    public LoanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Loan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Loans
            .Include(l => l.Asset)
            .Include(l => l.User)
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.RequestedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetByAssetAsync(Guid assetId, CancellationToken cancellationToken = default)
        => await _context.Loans
            .Where(l => l.AssetId == assetId)
            .OrderByDescending(l => l.RequestedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetByStatusAsync(LoanStatus status, CancellationToken cancellationToken = default)
        => await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Status == status)
            .OrderByDescending(l => l.RequestedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetActiveLoansAsync(CancellationToken cancellationToken = default)
        => await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Status == LoanStatus.Active)
            .OrderBy(l => l.Period.End)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetManagedLoansAsync(CancellationToken cancellationToken = default)
        => await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Status == LoanStatus.Pending || l.Status == LoanStatus.Active || l.Status == LoanStatus.Overdue)
            .OrderByDescending(l => l.RequestedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetOverdueLoansAsync(CancellationToken cancellationToken = default)
        => await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Status == LoanStatus.Overdue)
            .OrderBy(l => l.Period.End)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Loan>> GetLoansDueWithinAsync(int hours, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var deadline = now.AddHours(hours);

        return await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Status == LoanStatus.Active
                && l.Period.End >= now
                && l.Period.End <= deadline)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Loan>> GetPastDueLoansAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Status == LoanStatus.Active && l.Period.End < now)
            .OrderBy(l => l.Period.End)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveLoanCountAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Loans
            .CountAsync(l => l.UserId == userId
                && (l.Status == LoanStatus.Active || l.Status == LoanStatus.Overdue), cancellationToken);

    public async Task<bool> HasOverlappingActiveLoanAsync(Guid assetId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        => await _context.Loans
            .AnyAsync(l =>
                l.AssetId == assetId &&
                (l.Status == LoanStatus.Active || l.Status == LoanStatus.Overdue) &&
                l.Period.Start < endDate &&
                l.Period.End > startDate,
                cancellationToken);

    public void Add(Loan loan) => _context.Loans.Add(loan);
    public void Update(Loan loan) => _context.Loans.Update(loan);
}
