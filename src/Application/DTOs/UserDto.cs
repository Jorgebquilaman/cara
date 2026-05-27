namespace Application.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}";
    public string InstitutionalEmail { get; set; }
    public string Dni { get; set; }
    public string? PhoneNumber { get; set; }
    public Guid? CareerId { get; set; }
    public string? CareerName { get; set; }
    public string? DepartmentName { get; set; }
    public string Role { get; set; }
    public bool IsActive { get; set; }
    public bool HasActiveSanctions { get; set; }
    public int ActiveLoanCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string InstitutionalEmail { get; set; }
    public string Dni { get; set; }
    public string? PhoneNumber { get; set; }
    public Guid? CareerId { get; set; }
    public string Role { get; set; }
    public string Password { get; set; }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; }
    public UserDto User { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}
