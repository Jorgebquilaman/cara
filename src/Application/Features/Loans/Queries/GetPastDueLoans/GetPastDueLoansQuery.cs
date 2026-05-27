using Application.DTOs;
using MediatR;

namespace Application.Features.Loans.Queries.GetPastDueLoans;

public record GetPastDueLoansQuery : IRequest<IReadOnlyList<LoanDto>>;
