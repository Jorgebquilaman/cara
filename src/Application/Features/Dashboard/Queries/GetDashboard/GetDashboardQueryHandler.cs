using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Dashboard.Queries.GetDashboard;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IAssetRepository _assetRepository;
    private readonly ILoanRepository _loanRepository;
    private readonly ISanctionRepository _sanctionRepository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetDashboardQueryHandler(
        IAssetRepository assetRepository,
        ILoanRepository loanRepository,
        ISanctionRepository sanctionRepository,
        IApplicationDbContext context,
        IMapper mapper)
    {
        _assetRepository = assetRepository;
        _loanRepository = loanRepository;
        _sanctionRepository = sanctionRepository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var assets = await _assetRepository.GetAllAsync(cancellationToken);
        var activeLoans = await _loanRepository.GetActiveLoansAsync(cancellationToken);
        var overdueLoans = await _loanRepository.GetOverdueLoansAsync(cancellationToken);
        var pastDueLoans = await _loanRepository.GetPastDueLoansAsync(cancellationToken);
        var pendingLoans = await _loanRepository.GetByStatusAsync(LoanStatus.Pending, cancellationToken);
        var dueSoon = await _loanRepository.GetLoansDueWithinAsync(24, cancellationToken);

        var allOverdue = overdueLoans.Concat(pastDueLoans).ToList();

        var reservations = await _context.Reservations
            .Include(r => r.Asset)
            .Include(r => r.User)
            .ToListAsync(cancellationToken);

        return new DashboardDto
        {
            TotalAssets = assets.Count,
            AvailableAssets = assets.Count(a => a.Status == AssetStatus.Available),
            ActiveLoans = activeLoans.Count,
            OverdueLoans = allOverdue.Count,
            PendingApprovals = pendingLoans.Count,
            TotalUsers = await _context.Users.CountAsync(cancellationToken),
            SurveysCompleted = await _context.SatisfactionSurveys.CountAsync(cancellationToken),
            UpcomingDueCount = dueSoon.Count,
            UpcomingDueLoans = _mapper.Map<List<LoanDto>>(dueSoon),
            OverdueLoansList = _mapper.Map<List<LoanDto>>(allOverdue),
            TotalReservations = reservations.Count,
            PendingReservations = reservations.Count(r => r.Status == ReservationStatus.Pending),
            ConfirmedReservations = reservations.Count(r => r.Status == ReservationStatus.Confirmed),
            CompletedReservations = reservations.Count(r => r.Status == ReservationStatus.Completed),
            CancelledReservations = reservations.Count(r => r.Status == ReservationStatus.Cancelled),
            RecentReservations = _mapper.Map<List<ReservationDto>>(reservations
                .OrderByDescending(r => r.CreatedAt).Take(10).ToList()),
        };
    }
}
