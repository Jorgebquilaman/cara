using Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using WebAPI.Hubs;

namespace WebAPI.Services;

public class WebNotificationService : IWebNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public WebNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(Guid userId, string type, string title, string message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", type, title, message, cancellationToken);
    }
}
