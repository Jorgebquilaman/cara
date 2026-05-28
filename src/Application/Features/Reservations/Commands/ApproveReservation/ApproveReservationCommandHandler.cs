using Application.Common.Interfaces;
using Application.Services;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Commands.ApproveReservation;

public class ApproveReservationCommandHandler : IRequestHandler<ApproveReservationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveReservationCommandHandler(
        IApplicationDbContext context,
        INotificationService notificationService,
        IUnitOfWork unitOfWork)
    {
        _context = context;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ApproveReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (reservation == null)
            throw new KeyNotFoundException($"Reservation {request.Id} not found.");

        reservation.Approve();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyReservationConfirmedAsync(reservation, cancellationToken);
    }
}
