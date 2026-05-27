using Application.DTOs;
using MediatR;

namespace Application.Features.Assets.Commands.CreateAsset;

public record CreateAssetCommand : IRequest<AssetDto>
{
    public string Code { get; init; }
    public string Name { get; init; }
    public string Category { get; init; }
    public string Department { get; init; }
    public string Location { get; init; }
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public int MaxLoanDays { get; init; } = 7;
}
