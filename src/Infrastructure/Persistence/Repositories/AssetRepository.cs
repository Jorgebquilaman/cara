using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class AssetRepository : IAssetRepository
{
    private readonly ApplicationDbContext _context;

    public AssetRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Asset?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Assets.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<Asset?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        => await _context.Assets.FirstOrDefaultAsync(a => a.Code == code, cancellationToken);

    public async Task<IReadOnlyList<Asset>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Assets.OrderBy(a => a.Code).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Asset>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
        => await _context.Assets.Where(a => a.Category == category).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Asset>> GetByStatusAsync(AssetStatus status, CancellationToken cancellationToken = default)
        => await _context.Assets.Where(a => a.Status == status).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Asset>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default)
        => await _context.Assets.Where(a => a.Department == department).ToListAsync(cancellationToken);

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
        => await _context.Assets.AnyAsync(a => a.Code == code, cancellationToken);

    public void Add(Asset asset) => _context.Assets.Add(asset);
    public void Update(Asset asset) => _context.Assets.Update(asset);
    public void Delete(Asset asset) => _context.Assets.Remove(asset);
}
