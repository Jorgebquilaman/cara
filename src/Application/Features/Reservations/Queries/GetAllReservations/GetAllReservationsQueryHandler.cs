using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Queries.GetAllReservations;

public class GetAllReservationsQueryHandler : IRequestHandler<GetAllReservationsQuery, IReadOnlyList<ReservationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllReservationsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ReservationDto>> Handle(GetAllReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Asset)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        var userIds = reservations.Select(r => r.UserId).Distinct().ToList();
        var avgRatings = await _context.Loans
            .Where(l => userIds.Contains(l.UserId) && l.UserRating != null && l.Status == LoanStatus.Returned)
            .GroupBy(l => l.UserId)
            .Select(g => new { UserId = g.Key, Avg = g.Average(l => (double)l.UserRating!) })
            .ToListAsync(cancellationToken);

        var ratingLookup = avgRatings.ToDictionary(x => x.UserId, x => x.Avg);

        var dtos = _mapper.Map<List<ReservationDto>>(reservations);
        foreach (var dto in dtos)
        {
            if (ratingLookup.TryGetValue(dto.UserId, out var avg))
                dto.UserAverageRating = avg;
        }

        return dtos;
    }
}
