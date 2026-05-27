namespace Domain.Exceptions;

public class LoanLimitExceededException : DomainException
{
    public int CurrentLoans { get; }
    public int MaxAllowed { get; }

    public LoanLimitExceededException(int currentLoans, int maxAllowed)
        : base($"User already has {currentLoans} active loans. Maximum allowed is {maxAllowed}.")
    {
        CurrentLoans = currentLoans;
        MaxAllowed = maxAllowed;
    }
}
