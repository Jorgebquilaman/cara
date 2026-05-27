namespace Application.DTOs;

public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetCode { get; set; }
    public string AssetName { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Space { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
