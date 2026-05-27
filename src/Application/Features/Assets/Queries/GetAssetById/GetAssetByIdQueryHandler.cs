using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Assets.Queries.GetAssetById;

public class GetAssetByIdQueryHandler : IRequestHandler<GetAssetByIdQuery, AssetDto>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IMapper _mapper;

    public GetAssetByIdQueryHandler(IAssetRepository assetRepository, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _mapper = mapper;
    }

    public async Task<AssetDto> Handle(GetAssetByIdQuery request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id, cancellationToken);
        if (asset == null)
            throw new KeyNotFoundException($"Asset with ID {request.Id} not found.");

        return _mapper.Map<AssetDto>(asset);
    }
}
