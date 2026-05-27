namespace Domain.Exceptions;

public class LoanPeriodException : DomainException
{
    public LoanPeriodException(string message) : base(message) { }
}
