using Application.Services;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Commands.SendOverdueAlert;

public class SendOverdueAlertCommandHandler : IRequestHandler<SendOverdueAlertCommand>
{
    private readonly ILoanRepository _loanRepository;
    private readonly INotificationService _notificationService;

    public SendOverdueAlertCommandHandler(
        ILoanRepository loanRepository,
        INotificationService notificationService)
    {
        _loanRepository = loanRepository;
        _notificationService = notificationService;
    }

    public async Task Handle(SendOverdueAlertCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new InvalidOperationException("Préstamo no encontrado");

        await _notificationService.NotifyLoanOverdueAsync(loan, cancellationToken);
    }
}
