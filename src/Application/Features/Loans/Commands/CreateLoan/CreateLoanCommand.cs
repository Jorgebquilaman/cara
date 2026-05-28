using Application.DTOs;
using MediatR;

namespace Application.Features.Loans.Commands.CreateLoan;

public record CreateLoanCommand : IRequest<LoanDto>
{
    public Guid AssetId { get; init; }
    public Guid UserId { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime DueDate { get; init; }
    public string? Observations { get; init; }
    public decimal Prenda { get; init; }
}
