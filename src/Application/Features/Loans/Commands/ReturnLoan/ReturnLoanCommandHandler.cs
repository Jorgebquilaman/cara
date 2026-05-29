using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Loans.Commands.ReturnLoan;

public class ReturnLoanCommandHandler : IRequestHandler<ReturnLoanCommand>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly IIncidentRepository _incidentRepository;
    private readonly INotificationService _notificationService;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ReturnLoanCommandHandler(
        ILoanRepository loanRepository,
        IAssetRepository assetRepository,
        IIncidentRepository incidentRepository,
        INotificationService notificationService,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork)
    {
        _loanRepository = loanRepository;
        _assetRepository = assetRepository;
        _incidentRepository = incidentRepository;
        _notificationService = notificationService;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ReturnLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        loan.Return(request.UserRating, request.UserRatingComment);

        var asset = await _assetRepository.GetByIdAsync(loan.AssetId, cancellationToken);

        _loanRepository.Update(loan);

        var hasIncident = !string.IsNullOrWhiteSpace(request.IncidentDescription);
        if (hasIncident)
        {
            var incident = new Incident(
                request.LoanId,
                request.IncidentDescription,
                loan.UserId,
                request.IncidentPhotoUrl);
            _incidentRepository.Add(incident);

            var notification = new Domain.Entities.Notification(
                loan.UserId,
                Domain.Enums.NotificationType.IncidentReported,
                "Incidente Reportado",
                $"Se reportó un incidente en la devolución de {loan.Asset.Name}: {request.IncidentDescription}",
                incident.Id.ToString());
            await _notificationService.SendNotificationAsync(notification, cancellationToken);
        }

        if (asset != null)
        {
            asset.ChangeStatus(hasIncident ? AssetStatus.Maintenance : AssetStatus.Available);
            _assetRepository.Update(asset);
        }

        var overdueNotifications = await _notificationRepository.GetByUserAndReferenceAsync(loan.UserId, loan.Id.ToString(), cancellationToken);
        foreach (var notif in overdueNotifications.Where(n => n.Type == NotificationType.LoanOverdue && !n.IsRead))
        {
            notif.MarkAsRead();
            _notificationRepository.Update(notif);
        }

        await _notificationService.NotifyLoanReturnedAsync(loan, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
