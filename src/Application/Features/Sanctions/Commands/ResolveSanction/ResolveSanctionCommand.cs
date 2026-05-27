using MediatR;

namespace Application.Features.Sanctions.Commands.ResolveSanction;

public record ResolveSanctionCommand : IRequest
{
    public Guid Id { get; init; }
}
