namespace Domain.Entities;

public class PasswordResetToken
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Token { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public bool IsUsed { get; private set; }

    public User User { get; private set; }

    private PasswordResetToken() { }

    public PasswordResetToken(Guid userId, string token, DateTime expiresAt)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Token = token;
        ExpiresAt = expiresAt;
        IsUsed = false;
    }

    public void MarkAsUsed()
    {
        IsUsed = true;
    }

    public bool IsValid() => !IsUsed && ExpiresAt > DateTime.UtcNow;
}
