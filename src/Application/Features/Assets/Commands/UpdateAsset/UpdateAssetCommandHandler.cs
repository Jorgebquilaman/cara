using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Assets.Commands.UpdateAsset;

public class UpdateAssetCommandHandler : IRequestHandler<UpdateAssetCommand, AssetDto>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateAssetCommandHandler(
        IAssetRepository assetRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AssetDto> Handle(UpdateAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id, cancellationToken);
        if (asset == null)
            throw new KeyNotFoundException($"Asset with ID {request.Id} not found.");

        asset.UpdateDetails(
            request.Name,
            request.Category,
            request.Department,
            request.Location,
            request.MaxLoanDays,
            request.Description);

        if (request.ImageUrl != null)
            asset.SetImage(request.ImageUrl);

        _assetRepository.Update(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AssetDto>(asset);
    }
}
