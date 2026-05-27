using MediatR;

namespace Application.Features.Loans.Commands.ApproveLoan;

public record ApproveLoanCommand(Guid LoanId, Guid ApprovedBy) : IRequest;
