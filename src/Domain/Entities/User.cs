using Domain.Enums;
using Domain.ValueObjects;

namespace Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public Email InstitutionalEmail { get; private set; }
    public string Dni { get; private set; }
    public string? PhoneNumber { get; private set; }
    public Guid? CareerId { get; private set; }
    public UserRole Role { get; private set; }
    public string PasswordHash { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public Career? Career { get; private set; }

    private readonly List<Loan> _loans = [];
    public IReadOnlyCollection<Loan> Loans => _loans.AsReadOnly();

    private readonly List<Sanction> _sanctions = [];
    public IReadOnlyCollection<Sanction> Sanctions => _sanctions.AsReadOnly();

    private readonly List<Reservation> _reservations = [];
    public IReadOnlyCollection<Reservation> Reservations => _reservations.AsReadOnly();

    private readonly List<Notification> _notifications = [];
    public IReadOnlyCollection<Notification> Notifications => _notifications.AsReadOnly();

    private User() { }

    public User(string firstName, string lastName, Email institutionalEmail, UserRole role, string passwordHash, string dni = "", string? phoneNumber = null, Guid? careerId = null, bool isActive = true)
    {
        Id = Guid.NewGuid();
        FirstName = firstName;
        LastName = lastName;
        InstitutionalEmail = institutionalEmail;
        Dni = dni;
        PhoneNumber = phoneNumber;
        CareerId = careerId;
        Role = role;
        PasswordHash = passwordHash;
        IsActive = isActive;
        CreatedAt = DateTime.UtcNow;
    }

    public bool HasActiveSanctions => _sanctions.Any(s => s.IsActive && s.ExpiresAt > DateTime.UtcNow);
    public int ActiveLoanCount => _loans.Count(l => l.Status is LoanStatus.Active or LoanStatus.Overdue);

    public int MaxConcurrentLoans => Role switch
    {
        UserRole.Student => 2,
        UserRole.Teacher => 5,
        UserRole.Staff => 10,
        UserRole.Admin => 20,
        _ => 2
    };

    public bool CanRequestLoan()
    {
        if (!IsActive) return false;
        if (HasActiveSanctions) return false;
        if (ActiveLoanCount >= MaxConcurrentLoans) return false;
        return true;
    }

    public void SetPassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string firstName, string lastName)
    {
        FirstName = firstName;
        LastName = lastName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string firstName, string lastName, string dni, string? phoneNumber, Guid? careerId)
    {
        FirstName = firstName;
        LastName = lastName;
        Dni = dni;
        PhoneNumber = phoneNumber;
        CareerId = careerId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeRole(UserRole role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
