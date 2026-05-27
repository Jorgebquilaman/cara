using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Commands.ApproveReservation;

public class ApproveReservationCommandHandler : IRequestHandler<ApproveReservationCommand>
{
    private readonly IApplicationDbContext _context;

    public ApproveReservationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ApproveReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (reservation == null)
            throw new KeyNotFoundException($"Reservation {request.Id} not found.");

        reservation.Approve();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
