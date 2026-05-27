using Domain.Enums;

namespace Domain.Entities;

public class Notification
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public NotificationType Type { get; private set; }
    public string Title { get; private set; }
    public string Message { get; private set; }
    public string? ReferenceId { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }
    public DateTime SentAt { get; private set; }

    public User User { get; private set; }

    private Notification() { }

    public Notification(Guid userId, NotificationType type, string title, string message, string? referenceId = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Type = type;
        Title = title;
        Message = message;
        ReferenceId = referenceId;
        IsRead = false;
        SentAt = DateTime.UtcNow;
    }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }
}
