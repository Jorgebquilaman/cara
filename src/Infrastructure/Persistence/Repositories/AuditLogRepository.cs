using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;

    public AuditLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.AuditLogs.OrderByDescending(al => al.Timestamp).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<AuditLog>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken = default)
        => await _context.AuditLogs
            .Where(al => al.EntityName == entityName && al.EntityId == entityId)
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<AuditLog>> GetByUserAsync(string performedBy, CancellationToken cancellationToken = default)
        => await _context.AuditLogs
            .Where(al => al.PerformedBy == performedBy)
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync(cancellationToken);

    public void Add(AuditLog auditLog) => _context.AuditLogs.Add(auditLog);
}
