using MediatR;

namespace Application.Features.Assets.Commands.DeleteAsset;

public record DeleteAssetCommand(Guid Id) : IRequest;
