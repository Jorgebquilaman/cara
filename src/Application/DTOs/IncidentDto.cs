namespace Application.DTOs;

public class IncidentDto
{
    public Guid Id { get; set; }
    public Guid LoanId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetCode { get; set; } = string.Empty;
    public string? AssetImageUrl { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public DateTime ReportedAt { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class CreateIncidentDto
{
    public Guid LoanId { get; set; }
    public string Description { get; set; }
    public string? PhotoUrl { get; set; }
}
