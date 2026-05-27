using Domain.Entities;

namespace Domain.Interfaces;

public interface INotificationRepository
{
    Task<IReadOnlyList<Notification>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Notification>> GetUnreadByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    void Add(Notification notification);
    Task<IReadOnlyList<Notification>> GetByUserAndReferenceAsync(Guid userId, string referenceId, CancellationToken cancellationToken = default);
    void Update(Notification notification);
}
