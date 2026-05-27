using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Queries.GetUserReservations;

public class GetUserReservationsQueryHandler : IRequestHandler<GetUserReservationsQuery, IReadOnlyList<ReservationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetUserReservationsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ReservationDto>> Handle(GetUserReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Asset)
            .Where(r => r.UserId == request.UserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<ReservationDto>>(reservations);
    }
}
