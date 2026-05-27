using Domain.Entities;

namespace Domain.Interfaces;

public interface IAuditLogRepository
{
    Task<IReadOnlyList<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AuditLog>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AuditLog>> GetByUserAsync(string performedBy, CancellationToken cancellationToken = default);
    void Add(AuditLog auditLog);
}
