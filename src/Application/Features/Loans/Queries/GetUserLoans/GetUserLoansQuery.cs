using Application.DTOs;
using MediatR;

namespace Application.Features.Loans.Queries.GetUserLoans;

public record GetUserLoansQuery(Guid UserId) : IRequest<IReadOnlyList<LoanDto>>;
