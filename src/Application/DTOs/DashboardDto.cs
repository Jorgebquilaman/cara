namespace Application.DTOs;

public class DashboardDto
{
    public int TotalAssets { get; set; }
    public int AvailableAssets { get; set; }
    public int ActiveLoans { get; set; }
    public int OverdueLoans { get; set; }
    public int PendingApprovals { get; set; }
    public int ActiveSanctions { get; set; }
    public IReadOnlyList<LoanDto> UpcomingDueLoans { get; set; }
    public IReadOnlyList<LoanDto> OverdueLoansList { get; set; }
    public int TotalReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int CompletedReservations { get; set; }
    public int CancelledReservations { get; set; }
    public IReadOnlyList<ReservationDto> RecentReservations { get; set; }
}

public class UserDashboardDto
{
    public int TotalLoans { get; set; }
    public int ActiveLoans { get; set; }
    public int ReturnedLoans { get; set; }
    public int PendingLoans { get; set; }
    public int OverdueLoans { get; set; }
    public IReadOnlyList<LoanDto> RecentLoans { get; set; }
    public int TotalReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int CompletedReservations { get; set; }
    public int CancelledReservations { get; set; }
    public IReadOnlyList<ReservationDto> RecentReservations { get; set; }
}
