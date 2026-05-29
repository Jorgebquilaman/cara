using Application.Common.Interfaces;
using Application.Services;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Commands.CancelReservation;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public CancelReservationCommandHandler(
        IApplicationDbContext context,
        INotificationService notificationService,
        IUnitOfWork unitOfWork)
    {
        _context = context;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Asset)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (reservation == null)
            throw new KeyNotFoundException($"Reservation {request.Id} not found.");

        reservation.Cancel();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyReservationCancelledAsync(reservation, cancellationToken);
    }
}
