using Domain.Enums;

namespace Domain.Entities;

public class Reservation
{
    public Guid Id { get; private set; }
    public Guid AssetId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public string Space { get; private set; }
    public ReservationStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public Asset Asset { get; private set; }
    public User User { get; private set; }

    private Reservation() { }

    public Reservation(Guid assetId, Guid userId, DateTime startDate, DateTime endDate, string space)
    {
        Id = Guid.NewGuid();
        AssetId = assetId;
        UserId = userId;
        StartDate = startDate;
        EndDate = endDate;
        Space = space;
        Status = ReservationStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        if (Status != ReservationStatus.Pending)
            throw new InvalidOperationException("Only pending reservations can be approved");

        Status = ReservationStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status != ReservationStatus.Pending && Status != ReservationStatus.Confirmed)
            throw new InvalidOperationException("Only pending or confirmed reservations can be cancelled");

        Status = ReservationStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != ReservationStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed reservations can be completed");

        Status = ReservationStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }
}
