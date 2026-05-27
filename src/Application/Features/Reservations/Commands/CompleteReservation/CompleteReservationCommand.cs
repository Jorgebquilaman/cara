using MediatR;

namespace Application.Features.Reservations.Commands.CompleteReservation;

public record CompleteReservationCommand(Guid Id) : IRequest;
