namespace Application.DTOs;

public class ContractDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Title { get; set; }
    public string? Content { get; set; }
    public string? Provider { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? FileUrl { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
