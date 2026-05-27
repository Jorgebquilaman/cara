using Domain.Entities;

namespace Domain.Interfaces;

public interface IAccountRequestRepository
{
    Task<IReadOnlyList<AccountRequest>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<AccountRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    void Add(AccountRequest request);
    void Update(AccountRequest request);
}
