using Application.DTOs;
using MediatR;

namespace Application.Features.Loans.Queries.GetManagedLoans;

public record GetManagedLoansQuery : IRequest<IReadOnlyList<LoanDto>>;
