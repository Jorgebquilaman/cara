using Application.Common.Interfaces;
using Domain.Entities;
using Domain.ValueObjects;
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
            .Include(r => r.Asset)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (reservation == null)
            throw new KeyNotFoundException($"Reservation {request.Id} not found.");

        reservation.Complete();

        var startDate = reservation.StartDate;
        var dueDate = reservation.EndDate;

        if (dueDate <= startDate)
            dueDate = startDate.AddDays(reservation.Asset?.MaxLoanDays ?? 7);

        var period = new LoanPeriod(startDate, dueDate);

        var loan = new Loan(
            reservation.AssetId,
            reservation.UserId,
            period);

        loan.Approve(Guid.Empty);
        loan.PickUp();

        _context.Loans.Add(loan);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
