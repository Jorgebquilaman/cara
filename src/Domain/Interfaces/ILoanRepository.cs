using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces;

public interface ILoanRepository
{
    Task<Loan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetByAssetAsync(Guid assetId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetByStatusAsync(LoanStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetActiveLoansAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetManagedLoansAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetOverdueLoansAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetLoansDueWithinAsync(int hours, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Loan>> GetPastDueLoansAsync(CancellationToken cancellationToken = default);
    Task<int> GetActiveLoanCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> HasOverlappingActiveLoanAsync(Guid assetId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    void Add(Loan loan);
    void Update(Loan loan);
}
