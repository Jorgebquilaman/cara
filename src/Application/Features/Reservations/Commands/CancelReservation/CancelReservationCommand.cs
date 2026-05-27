using MediatR;

namespace Application.Features.Reservations.Commands.CancelReservation;

public record CancelReservationCommand(Guid Id) : IRequest;
