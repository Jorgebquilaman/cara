namespace Application.Common.Interfaces;

public interface IWebNotificationService
{
    Task SendNotificationAsync(Guid userId, string type, string title, string message, CancellationToken cancellationToken = default);
}
