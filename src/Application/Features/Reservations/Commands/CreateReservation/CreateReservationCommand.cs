using Application.DTOs;
using MediatR;

namespace Application.Features.Reservations.Commands.CreateReservation;

public record CreateReservationCommand : IRequest<ReservationDto>
{
    public Guid AssetId { get; init; }
    public Guid UserId { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Space { get; init; }
}
