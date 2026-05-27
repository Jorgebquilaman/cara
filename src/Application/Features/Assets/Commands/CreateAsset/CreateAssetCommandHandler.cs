using Application.DTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Assets.Commands.CreateAsset;

public class CreateAssetCommandHandler : IRequestHandler<CreateAssetCommand, AssetDto>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateAssetCommandHandler(
        IAssetRepository assetRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AssetDto> Handle(CreateAssetCommand request, CancellationToken cancellationToken)
    {
        var exists = await _assetRepository.ExistsByCodeAsync(request.Code, cancellationToken);
        if (exists)
            throw new InvalidOperationException($"Asset with code '{request.Code}' already exists.");

        var asset = new Asset(
            request.Code,
            request.Name,
            request.Category,
            request.Department,
            request.Location,
            request.MaxLoanDays,
            request.Description);

        if (request.ImageUrl != null)
            asset.SetImage(request.ImageUrl);

        _assetRepository.Add(asset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AssetDto>(asset);
    }
}
