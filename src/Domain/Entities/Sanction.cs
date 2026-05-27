namespace Domain.Entities;

public class Sanction
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Reason { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public DateTime IssuedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public bool IsActive { get; private set; }

    public User User { get; private set; }

    private Sanction() { }

    public Sanction(Guid userId, string reason, DateTime expiresAt, string? attachmentUrl = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Reason = reason;
        AttachmentUrl = attachmentUrl;
        IssuedAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
        IsActive = true;
        ResolvedAt = null;
    }

    public void Resolve()
    {
        IsActive = false;
        ResolvedAt = DateTime.UtcNow;
    }
}
