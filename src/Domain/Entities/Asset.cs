using Domain.Enums;

namespace Domain.Entities;

public class Asset
{
    public Guid Id { get; private set; }
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string Category { get; private set; }
    public AssetStatus Status { get; private set; }
    public string Department { get; private set; }
    public string Location { get; private set; }
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public int MaxLoanDays { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<Loan> _loans = [];
    public IReadOnlyCollection<Loan> Loans => _loans.AsReadOnly();

    private readonly List<Reservation> _reservations = [];
    public IReadOnlyCollection<Reservation> Reservations => _reservations.AsReadOnly();

    private Asset() { }

    public Asset(string code, string name, string category, string department, string location, int maxLoanDays, string? description = null)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        Category = category;
        Status = AssetStatus.Available;
        Department = department;
        Location = location;
        Description = description;
        MaxLoanDays = maxLoanDays;
        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetImage(string? imageUrl)
    {
        ImageUrl = imageUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string category, string department, string location, int maxLoanDays, string? description = null)
    {
        Name = name;
        Category = category;
        Department = department;
        Location = location;
        MaxLoanDays = maxLoanDays;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeStatus(AssetStatus newStatus)
    {
        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
