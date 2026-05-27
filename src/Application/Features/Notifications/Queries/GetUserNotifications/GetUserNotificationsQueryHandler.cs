using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Notifications.Queries.GetUserNotifications;

public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, IReadOnlyList<NotificationDto>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;

    public GetUserNotificationsQueryHandler(INotificationRepository notificationRepository, IMapper mapper)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<NotificationDto>> GetUserNotifications(GetUserNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _notificationRepository.GetByUserAsync(request.UserId, cancellationToken);
        return _mapper.Map<List<NotificationDto>>(notifications);
    }

    public async Task<IReadOnlyList<NotificationDto>> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken)
        => await GetUserNotifications(request, cancellationToken);
}
