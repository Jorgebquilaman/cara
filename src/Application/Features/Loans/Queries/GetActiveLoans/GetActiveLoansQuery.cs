using Application.DTOs;
using MediatR;

namespace Application.Features.Loans.Queries.GetActiveLoans;

public record GetActiveLoansQuery : IRequest<IReadOnlyList<LoanDto>>;
