using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces;

public interface IAssetRepository
{
    Task<Asset?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Asset?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Asset>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Asset>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Asset>> GetByStatusAsync(AssetStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Asset>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
    void Add(Asset asset);
    void Update(Asset asset);
    void Delete(Asset asset);
}
