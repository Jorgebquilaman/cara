using MediatR;

namespace Application.Features.Loans.Commands.RejectLoan;

public record RejectLoanCommand(Guid LoanId, Guid RejectedBy, string Reason) : IRequest;
