using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.Features.Surveys.Commands.CreateSurvey;

public record CreateSurveyCommand(
    Guid LoanId,
    int OverallRating,
    int ServiceRating,
    int RequestTimeRating,
    int AssetQualityRating,
    string? Comments) : IRequest<Guid>;

public class CreateSurveyCommandHandler : IRequestHandler<CreateSurveyCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateSurveyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSurveyCommand request, CancellationToken cancellationToken)
    {
        var survey = new SatisfactionSurvey(
            request.LoanId,
            request.OverallRating,
            request.ServiceRating,
            request.RequestTimeRating,
            request.AssetQualityRating,
            request.Comments
        );

        _context.SatisfactionSurveys.Add(survey);
        await _context.SaveChangesAsync(cancellationToken);

        return survey.Id;
    }
}