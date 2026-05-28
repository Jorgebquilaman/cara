using Domain.Enums;
using Domain.ValueObjects;

namespace Domain.Entities;

public class Loan
{
    public Guid Id { get; private set; }
    public Guid AssetId { get; private set; }
    public Guid UserId { get; private set; }
    public LoanPeriod Period { get; private set; }
    public LoanStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? Observations { get; private set; }
    public decimal Prenda { get; private set; }
    public DateTime RequestedAt { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public DateTime? ReturnedAt { get; private set; }
    public Guid? ApprovedBy { get; private set; }

    public Asset Asset { get; private set; }
    public User User { get; private set; }

    private readonly List<Incident> _incidents = [];
    public IReadOnlyCollection<Incident> Incidents => _incidents.AsReadOnly();

    private Loan() { }

    public Loan(Guid assetId, Guid userId, LoanPeriod period, string? observations = null, decimal prenda = 0)
    {
        Id = Guid.NewGuid();
        AssetId = assetId;
        UserId = userId;
        Period = period;
        Observations = observations;
        Prenda = prenda;
        Status = LoanStatus.Pending;
        RequestedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != LoanStatus.Pending)
            throw new InvalidOperationException("Only pending loans can be approved");

        Status = LoanStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
        ApprovedBy = approvedBy;
    }

    public void PickUp()
    {
        if (Status != LoanStatus.Approved)
            throw new InvalidOperationException("Only approved loans can be picked up");

        Status = LoanStatus.Active;
        // Period.Start could be adjusted here if needed when picked up
    }

    public void Reject(string reason, Guid rejectedBy)
    {
        if (Status != LoanStatus.Pending)
            throw new InvalidOperationException("Only pending loans can be rejected");

        Status = LoanStatus.Rejected;
        RejectionReason = reason;
        ApprovedBy = rejectedBy;
    }

    public void Return()
    {
        if (Status is not (LoanStatus.Active or LoanStatus.Overdue))
            throw new InvalidOperationException("Only active or overdue loans can be returned");

        Status = LoanStatus.Returned;
        ReturnedAt = DateTime.UtcNow;
    }

    public void MarkOverdue()
    {
        if (Status != LoanStatus.Active)
            throw new InvalidOperationException("Only active loans can become overdue");

        Status = LoanStatus.Overdue;
    }
}
