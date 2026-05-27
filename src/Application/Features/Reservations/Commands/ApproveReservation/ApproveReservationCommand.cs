using MediatR;

namespace Application.Features.Reservations.Commands.ApproveReservation;

public record ApproveReservationCommand(Guid Id) : IRequest;
