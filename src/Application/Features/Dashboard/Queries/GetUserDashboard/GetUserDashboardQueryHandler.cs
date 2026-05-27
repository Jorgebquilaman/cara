using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Dashboard.Queries.GetUserDashboard;

public class GetUserDashboardQueryHandler : IRequestHandler<GetUserDashboardQuery, UserDashboardDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetUserDashboardQueryHandler(ILoanRepository loanRepository, IApplicationDbContext context, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDashboardDto> Handle(GetUserDashboardQuery request, CancellationToken cancellationToken)
    {
        var loans = await _loanRepository.GetByUserAsync(request.UserId, cancellationToken);

        var reservations = await _context.Reservations
            .Include(r => r.Asset)
            .Where(r => r.UserId == request.UserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return new UserDashboardDto
        {
            TotalLoans = loans.Count,
            ActiveLoans = loans.Count(l => l.Status is LoanStatus.Active or LoanStatus.Overdue),
            ReturnedLoans = loans.Count(l => l.Status == LoanStatus.Returned),
            PendingLoans = loans.Count(l => l.Status == LoanStatus.Pending),
            OverdueLoans = loans.Count(l => l.Status == LoanStatus.Overdue),
            RecentLoans = _mapper.Map<List<LoanDto>>(loans.Take(10).ToList()),
            TotalReservations = reservations.Count,
            ConfirmedReservations = reservations.Count(r => r.Status == ReservationStatus.Confirmed),
            CompletedReservations = reservations.Count(r => r.Status == ReservationStatus.Completed),
            CancelledReservations = reservations.Count(r => r.Status == ReservationStatus.Cancelled),
            RecentReservations = _mapper.Map<List<ReservationDto>>(reservations.Take(10).ToList()),
        };
    }
}
