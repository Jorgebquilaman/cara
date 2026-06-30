using MediatR;

namespace Application.Features.Contracts.Commands.DeleteContract;

public record DeleteContractCommand(Guid Id) : IRequest;
