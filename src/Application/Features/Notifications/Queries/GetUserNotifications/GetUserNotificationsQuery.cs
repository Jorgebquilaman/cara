using Application.DTOs;
using MediatR;

namespace Application.Features.Notifications.Queries.GetUserNotifications;

public record GetUserNotificationsQuery(Guid UserId) : IRequest<IReadOnlyList<NotificationDto>>;
