namespace Domain.Entities;

public class SatisfactionSurvey
{
    public Guid Id { get; private set; }
    public Guid LoanId { get; private set; }
    public Loan Loan { get; private set; } = null!;
    
    public int OverallRating { get; private set; }
    public int ServiceRating { get; private set; }
    public int RequestTimeRating { get; private set; }
    public int AssetQualityRating { get; private set; }
    public string? Comments { get; private set; }
    
    public DateTime CreatedAt { get; private set; }

    public SatisfactionSurvey(Guid loanId, int overallRating, int serviceRating, int requestTimeRating, int assetQualityRating, string? comments)
    {
        Id = Guid.NewGuid();
        LoanId = loanId;
        OverallRating = overallRating;
        ServiceRating = serviceRating;
        RequestTimeRating = requestTimeRating;
        AssetQualityRating = assetQualityRating;
        Comments = comments;
        CreatedAt = DateTime.UtcNow;
    }
}