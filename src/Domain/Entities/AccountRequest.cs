namespace Domain.Entities;

public class AccountRequest
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Email { get; private set; }
    public string Dni { get; private set; }
    public string? PhoneNumber { get; private set; }
    public Guid? CareerId { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public string RequestedRole { get; private set; }
    public string Reason { get; private set; }
    public DateTime RequestedAt { get; private set; }
    public bool IsApproved { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public string? ApprovedByUserId { get; private set; }
    public bool Notified { get; private set; }
    public bool IsRejected { get; private set; }
    public string? RejectionReason { get; private set; }

    private AccountRequest() { }

    public AccountRequest(string firstName, string lastName, string email, string dni, string requestedRole, string reason, string? phoneNumber = null, Guid? careerId = null, string? attachmentUrl = null)
    {
        Id = Guid.NewGuid();
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Dni = dni;
        PhoneNumber = phoneNumber;
        CareerId = careerId;
        RequestedRole = requestedRole;
        Reason = reason;
        AttachmentUrl = attachmentUrl;
        RequestedAt = DateTime.UtcNow;
        IsApproved = false;
        Notified = false;
    }

    public void Approve(string approvedByUserId)
    {
        IsApproved = true;
        ApprovedAt = DateTime.UtcNow;
        ApprovedByUserId = approvedByUserId;
    }

    public void Reject(string reason)
    {
        IsRejected = true;
        RejectionReason = reason;
    }

    public void MarkNotified()
    {
        Notified = true;
    }
}
