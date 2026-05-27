using Application.DTOs;
using MediatR;

namespace Application.Features.Reservations.Queries.GetUserReservations;

public record GetUserReservationsQuery(Guid UserId) : IRequest<IReadOnlyList<ReservationDto>>;
