namespace Domain.Exceptions;

public class UserSanctionedException : DomainException
{
    public Guid UserId { get; }

    public UserSanctionedException(Guid userId)
        : base($"User {userId} has active sanctions and cannot request loans.")
    {
        UserId = userId;
    }
}
