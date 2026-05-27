using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Notification>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.SentAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Notification>> GetUnreadByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.SentAt)
            .ToListAsync(cancellationToken);

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
        => await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

    public async Task<IReadOnlyList<Notification>> GetByUserAndReferenceAsync(Guid userId, string referenceId, CancellationToken cancellationToken = default)
        => await _context.Notifications
            .Where(n => n.UserId == userId && n.ReferenceId == referenceId)
            .OrderByDescending(n => n.SentAt)
            .ToListAsync(cancellationToken);

    public void Add(Notification notification) => _context.Notifications.Add(notification);
    public void Update(Notification notification) => _context.Notifications.Update(notification);
}
