using Domain.Interfaces;
using MediatR;

namespace Application.Features.Assets.Commands.DeleteAsset;

public class DeleteAssetCommandHandler : IRequestHandler<DeleteAssetCommand>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAssetCommandHandler(IAssetRepository assetRepository, IUnitOfWork unitOfWork)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id, cancellationToken);
        if (asset == null)
            throw new KeyNotFoundException($"Asset with ID {request.Id} not found.");

        asset.SoftDelete();
        _assetRepository.Update(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
