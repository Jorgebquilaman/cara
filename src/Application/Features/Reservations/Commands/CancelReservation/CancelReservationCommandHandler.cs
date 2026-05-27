using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Commands.CancelReservation;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand>
{
    private readonly IApplicationDbContext _context;

    public CancelReservationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (reservation == null)
            throw new KeyNotFoundException($"Reservation {request.Id} not found.");

        reservation.Cancel();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
