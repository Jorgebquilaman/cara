using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Commands.PickUpLoan;

public record PickUpLoanCommand(Guid LoanId) : IRequest;

public class PickUpLoanCommandHandler : IRequestHandler<PickUpLoanCommand>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PickUpLoanCommandHandler(ILoanRepository loanRepository, IUnitOfWork unitOfWork)
    {
        _loanRepository = loanRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(PickUpLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        loan.PickUp();
        _loanRepository.Update(loan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}