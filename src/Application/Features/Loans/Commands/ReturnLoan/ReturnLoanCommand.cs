using MediatR;

namespace Application.Features.Loans.Commands.ReturnLoan;

public record ReturnLoanCommand(Guid LoanId, string? IncidentDescription = null, string? IncidentPhotoUrl = null, int? UserRating = null, string? UserRatingComment = null) : IRequest;
