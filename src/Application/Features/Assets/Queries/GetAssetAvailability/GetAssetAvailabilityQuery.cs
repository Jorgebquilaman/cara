using Application.DTOs;
using MediatR;

namespace Application.Features.Assets.Queries.GetAssetAvailability;

public record GetAssetAvailabilityQuery : IRequest<AssetAvailabilityDto>
{
    public Guid AssetId { get; init; }
    public DateTime Start { get; init; }
    public DateTime End { get; init; }
}
