namespace Application.DTOs;

public class UserHistoryDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}";
    public string InstitutionalEmail { get; set; }
    public string Role { get; set; }
    public bool IsActive { get; set; }
    public List<LoanDto> Loans { get; set; } = [];
    public List<IncidentDto> Incidents { get; set; } = [];
    public List<SanctionDto> Sanctions { get; set; } = [];
}
