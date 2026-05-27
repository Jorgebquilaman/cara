using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
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

        return _mapper.Map<List<ReservationDto>>(reservations);
    }
}
