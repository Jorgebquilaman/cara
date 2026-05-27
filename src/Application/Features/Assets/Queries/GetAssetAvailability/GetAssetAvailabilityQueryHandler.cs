using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Assets.Queries.GetAssetAvailability;

public class GetAssetAvailabilityQueryHandler : IRequestHandler<GetAssetAvailabilityQuery, AssetAvailabilityDto>
{
    private readonly IApplicationDbContext _context;

    public GetAssetAvailabilityQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AssetAvailabilityDto> Handle(GetAssetAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var start = DateTime.SpecifyKind(request.Start, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(request.End, DateTimeKind.Utc);

        var loanRanges = await _context.Loans
            .Where(l => l.AssetId == request.AssetId
                && (l.Status == LoanStatus.Active || l.Status == LoanStatus.Overdue)
                && l.Period.Start < end
                && l.Period.End > start)
            .Select(l => new DateRangeDto
            {
                Start = l.Period.Start,
                End = l.Period.End,
                Type = "Loan"
            })
            .ToListAsync(cancellationToken);

        var reservationRanges = await _context.Reservations
            .Where(r => r.AssetId == request.AssetId
                && r.Status == ReservationStatus.Confirmed
                && r.StartDate < end
                && r.EndDate > start)
            .Select(r => new DateRangeDto
            {
                Start = r.StartDate,
                End = r.EndDate,
                Type = "Reservation"
            })
            .ToListAsync(cancellationToken);

        return new AssetAvailabilityDto
        {
            AssetId = request.AssetId,
            BookedRanges = [.. loanRanges, .. reservationRanges],
        };
    }
}
