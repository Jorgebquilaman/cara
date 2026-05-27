namespace Domain.Entities;

public class AuditLog
{
    public Guid Id { get; private set; }
    public string EntityName { get; private set; }
    public string EntityId { get; private set; }
    public string Action { get; private set; }
    public string PerformedBy { get; private set; }
    public string? PreviousValues { get; private set; }
    public string? NewValues { get; private set; }
    public DateTime Timestamp { get; private set; }

    private AuditLog() { }

    public AuditLog(string entityName, string entityId, string action, string performedBy, string? previousValues = null, string? newValues = null)
    {
        Id = Guid.NewGuid();
        EntityName = entityName;
        EntityId = entityId;
        Action = action;
        PerformedBy = performedBy;
        PreviousValues = previousValues;
        NewValues = newValues;
        Timestamp = DateTime.UtcNow;
    }
}
