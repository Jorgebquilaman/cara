using Application.DTOs;
using MediatR;

namespace Application.Features.Reservations.Queries.GetAllReservations;

public record GetAllReservationsQuery : IRequest<IReadOnlyList<ReservationDto>>;
