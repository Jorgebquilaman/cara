using Application.Services;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Commands.RejectLoan;

public class RejectLoanCommandHandler : IRequestHandler<RejectLoanCommand>
{
    private readonly ILoanRepository _loanRepository;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public RejectLoanCommandHandler(
        ILoanRepository loanRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork)
    {
        _loanRepository = loanRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RejectLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        loan.Reject(request.Reason, request.RejectedBy);
        _loanRepository.Update(loan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyLoanRejectedAsync(loan, request.Reason, cancellationToken);
    }
}
