using Domain.Exceptions;

namespace Domain.ValueObjects;

public record LoanPeriod
{
    public DateTime Start { get; init; }
    public DateTime End { get; init; }

    private LoanPeriod() { }

    public LoanPeriod(DateTime start, DateTime end)
    {
        if (start.Kind != DateTimeKind.Utc) start = DateTime.SpecifyKind(start, DateTimeKind.Utc);
        if (end.Kind != DateTimeKind.Utc) end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

        if (start >= end)
            throw new LoanPeriodException("Start date must be before end date");

        Start = start;
        End = end;
    }

    public int DurationInDays => (End - Start).Days;
    public bool IsOverdue(DateTime asOf) => asOf > End;

    public static LoanPeriod FromDays(DateTime start, int days)
        => new(start, start.AddDays(days));
}
