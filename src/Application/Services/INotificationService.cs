using Domain.Entities;

namespace Application.Services;

public interface INotificationService
{
    Task SendNotificationAsync(Notification notification, CancellationToken cancellationToken = default);
    Task NotifyLoanApprovedAsync(Loan loan, CancellationToken cancellationToken = default);
    Task NotifyLoanRejectedAsync(Loan loan, string reason, CancellationToken cancellationToken = default);
    Task NotifyLoanDueReminderAsync(Loan loan, CancellationToken cancellationToken = default);
    Task NotifyLoanOverdueAsync(Loan loan, CancellationToken cancellationToken = default);
    Task NotifySanctionIssuedAsync(Sanction sanction, CancellationToken cancellationToken = default);
    Task NotifyNewLoanRequestAsync(Loan loan, CancellationToken cancellationToken = default);
    Task NotifyLoanReturnedAsync(Loan loan, CancellationToken cancellationToken = default);
    Task NotifyReservationCreatedAsync(Reservation reservation, CancellationToken cancellationToken = default);
    Task NotifyReservationConfirmedAsync(Reservation reservation, CancellationToken cancellationToken = default);
    Task NotifyReservationCancelledAsync(Reservation reservation, CancellationToken cancellationToken = default);
}
