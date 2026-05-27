using Application.DTOs;
using Application.DTOs.Common;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Assets.Queries.GetAllAssets;

public class GetAllAssetsQueryHandler : IRequestHandler<GetAllAssetsQuery, PaginatedList<AssetDto>>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IMapper _mapper;

    public GetAllAssetsQueryHandler(IAssetRepository assetRepository, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedList<AssetDto>> Handle(GetAllAssetsQuery request, CancellationToken cancellationToken)
    {
        var assets = await _assetRepository.GetAllAsync(cancellationToken);

        var filtered = assets.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            filtered = filtered.Where(a =>
                a.Name.ToLower().Contains(term) ||
                a.Code.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
            filtered = filtered.Where(a => a.Category == request.Category);

        if (!string.IsNullOrWhiteSpace(request.Status))
            filtered = filtered.Where(a => a.Status.ToString() == request.Status);

        if (!string.IsNullOrWhiteSpace(request.Department))
            filtered = filtered.Where(a => a.Department == request.Department);

        var list = filtered.ToList();
        var total = list.Count;

        var paged = list
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var dtos = _mapper.Map<List<AssetDto>>(paged);

        return new PaginatedList<AssetDto>(dtos, total, request.PageNumber, request.PageSize);
    }
}
