using Application.DTOs;
using Application.DTOs.Common;
using MediatR;

namespace Application.Features.Assets.Queries.GetAllAssets;

public record GetAllAssetsQuery : IRequest<PaginatedList<AssetDto>>
{
    public string? SearchTerm { get; init; }
    public string? Category { get; init; }
    public string? Status { get; init; }
    public string? Department { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
