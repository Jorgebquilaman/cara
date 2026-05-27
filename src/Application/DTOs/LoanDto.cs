namespace Application.DTOs;

public class LoanDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetCode { get; set; }
    public string AssetName { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string? Message { get; set; }
}

public class CreateLoanDto
{
    public Guid AssetId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
}

public class ApproveLoanDto
{
    public string? Notes { get; set; }
}

public class RejectLoanDto
{
    public string Reason { get; set; }
}

public class ReturnLoanDto
{
    public string? IncidentDescription { get; set; }
    public string? IncidentPhotoUrl { get; set; }
}
