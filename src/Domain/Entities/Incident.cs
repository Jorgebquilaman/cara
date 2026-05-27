namespace Domain.Entities;

public class Incident
{
    public Guid Id { get; private set; }
    public Guid LoanId { get; private set; }
    public string Description { get; private set; }
    public string? PhotoUrl { get; private set; }
    public DateTime ReportedAt { get; private set; }
    public Guid ReportedBy { get; private set; }
    public bool IsResolved { get; private set; }
    public DateTime? ResolvedAt { get; private set; }

    public Loan Loan { get; private set; }

    private Incident() { }

    public Incident(Guid loanId, string description, Guid reportedBy, string? photoUrl = null)
    {
        Id = Guid.NewGuid();
        LoanId = loanId;
        Description = description;
        PhotoUrl = photoUrl;
        ReportedAt = DateTime.UtcNow;
        ReportedBy = reportedBy;
        IsResolved = false;
    }

    public void Resolve()
    {
        IsResolved = true;
        ResolvedAt = DateTime.UtcNow;
    }
}
