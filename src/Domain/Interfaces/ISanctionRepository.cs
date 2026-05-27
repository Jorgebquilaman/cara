using Domain.Entities;

namespace Domain.Interfaces;

public interface ISanctionRepository
{
    Task<Sanction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Sanction>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Sanction>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Sanction>> GetActiveByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Sanction>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<bool> UserHasActiveSanctionsAsync(Guid userId, CancellationToken cancellationToken = default);
    void Add(Sanction sanction);
    void Update(Sanction sanction);
}
