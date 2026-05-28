using Application.Common.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;

namespace Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWebNotificationService _webNotificationService;

    public NotificationService(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        IWebNotificationService webNotificationService)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _webNotificationService = webNotificationService;
    }

    public async Task SendNotificationAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        _notificationRepository.Add(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _webNotificationService.SendNotificationAsync(
            notification.UserId,
            notification.Type.ToString(),
            notification.Title,
            notification.Message,
            cancellationToken);

        // TODO: Integrate with FCM for push notifications
        // await _fcmService.SendAsync(notification);
    }

    public async Task NotifyLoanApprovedAsync(Loan loan, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            loan.UserId,
            NotificationType.LoanApproved,
            "Préstamo Aprobado",
            $"Tu préstamo del activo {loan.Asset.Name} ha sido aprobado. Vence el {loan.Period.End:dd/MM/yyyy}.",
            loan.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyLoanRejectedAsync(Loan loan, string reason, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            loan.UserId,
            NotificationType.LoanRejected,
            "Préstamo Rechazado",
            $"Tu préstamo del activo {loan.Asset.Name} fue rechazado. Motivo: {reason}",
            loan.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyLoanDueReminderAsync(Loan loan, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            loan.UserId,
            NotificationType.LoanDueReminder,
            "Recordatorio de Vencimiento",
            $"El préstamo del activo {loan.Asset.Name} vence el {loan.Period.End:dd/MM/yyyy}. Por favor devolvélo a tiempo.",
            loan.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyLoanOverdueAsync(Loan loan, CancellationToken cancellationToken = default)
    {
        var daysOverdue = (int)(DateTime.UtcNow - loan.Period.End).TotalDays;
        var notification = new Notification(
            loan.UserId,
            NotificationType.LoanOverdue,
            "Préstamo Vencido",
            $"El préstamo del activo {loan.Asset.Name} venció hace {daysOverdue} día{(daysOverdue != 1 ? "s" : "")}. Por favor devolvélo inmediatamente.",
            loan.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifySanctionIssuedAsync(Sanction sanction, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            sanction.UserId,
            NotificationType.SanctionIssued,
            "Sanción Aplicada",
            $"Se ha aplicado una sanción: {sanction.Reason}",
            sanction.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyLoanReturnedAsync(Loan loan, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            loan.UserId,
            NotificationType.LoanReturned,
            "Préstamo Devuelto",
            $"El activo {loan.Asset.Name} fue devuelto correctamente.",
            loan.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyNewLoanRequestAsync(Loan loan, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            loan.UserId,
            NotificationType.LoanApproved,
            "Solicitud de Préstamo Creada",
            $"Tu solicitud para el activo {loan.Asset.Name} está pendiente de aprobación.",
            loan.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyReservationCreatedAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            reservation.UserId,
            NotificationType.ReservationCreated,
            "Reserva Creada",
            $"Tu reserva del espacio {reservation.Space} para el {reservation.StartDate:dd/MM/yyyy} fue creada exitosamente.",
            reservation.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyReservationConfirmedAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            reservation.UserId,
            NotificationType.ReservationConfirmed,
            "Reserva Confirmada",
            $"Tu reserva del espacio {reservation.Space} fue confirmada.",
            reservation.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }

    public async Task NotifyReservationCancelledAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(
            reservation.UserId,
            NotificationType.ReservationCancelled,
            "Reserva Cancelada",
            $"Tu reserva del espacio {reservation.Space} del {reservation.StartDate:dd/MM/yyyy} fue cancelada.",
            reservation.Id.ToString());

        await SendNotificationAsync(notification, cancellationToken);
    }
}
