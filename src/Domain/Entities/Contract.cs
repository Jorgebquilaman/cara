using Domain.Enums;

namespace Domain.Entities;

public class Contract
{
    public Guid Id { get; private set; }
    public string Code { get; private set; }
    public string Title { get; private set; }
    public string? Content { get; private set; }
    public string? Provider { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string? FileUrl { get; private set; }
    public ContractStatus Status { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private Contract() { }

    public Contract(string code, string title, string? content, string? provider, DateTime startDate, DateTime? endDate, string? fileUrl)
    {
        Id = Guid.NewGuid();
        Code = code;
        Title = title;
        Content = content;
        Provider = provider;
        StartDate = startDate;
        EndDate = endDate;
        FileUrl = fileUrl;
        Status = ContractStatus.Active;
        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string title, string? content, string? provider, DateTime startDate, DateTime? endDate, string? fileUrl, ContractStatus status)
    {
        Title = title;
        Content = content;
        Provider = provider;
        StartDate = startDate;
        EndDate = endDate;
        FileUrl = fileUrl;
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
