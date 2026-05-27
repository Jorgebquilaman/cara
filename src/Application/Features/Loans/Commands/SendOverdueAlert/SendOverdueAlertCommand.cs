using MediatR;

namespace Application.Features.Loans.Commands.SendOverdueAlert;

public record SendOverdueAlertCommand(Guid LoanId) : IRequest;
