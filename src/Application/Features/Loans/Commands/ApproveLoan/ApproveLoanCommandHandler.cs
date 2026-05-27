using Application.Services;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Commands.ApproveLoan;

public class ApproveLoanCommandHandler : IRequestHandler<ApproveLoanCommand>
{
    private readonly ILoanRepository _loanRepository;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveLoanCommandHandler(
        ILoanRepository loanRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork)
    {
        _loanRepository = loanRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ApproveLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        loan.Approve(request.ApprovedBy);
        _loanRepository.Update(loan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyLoanApprovedAsync(loan, cancellationToken);
    }
}
