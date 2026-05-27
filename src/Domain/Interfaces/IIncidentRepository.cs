using Domain.Entities;

namespace Domain.Interfaces;

public interface IIncidentRepository
{
    Task<IReadOnlyList<Incident>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Incident?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Incident>> GetByLoanAsync(Guid loanId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Incident>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    void Add(Incident incident);
    void Update(Incident incident);
}
