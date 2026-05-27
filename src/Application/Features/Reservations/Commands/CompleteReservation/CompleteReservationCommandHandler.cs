using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Commands.CompleteReservation;

public class CompleteReservationCommandHandler : IRequestHandler<CompleteReservationCommand>
{
    private readonly IApplicationDbContext _context;

    public CompleteReservationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CompleteReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (reservation == null)
            throw new KeyNotFoundException($"Reservation {request.Id} not found.");

        reservation.Complete();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
