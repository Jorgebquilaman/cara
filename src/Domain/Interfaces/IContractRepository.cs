using Domain.Entities;

namespace Domain.Interfaces;

public interface IContractRepository
{
    Task<Contract?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Contract>> GetAllAsync(CancellationToken cancellationToken = default);
    void Add(Contract contract);
    void Update(Contract contract);
}
