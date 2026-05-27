using Application.DTOs;
using MediatR;

namespace Application.Features.Assets.Queries.GetAssetById;

public record GetAssetByIdQuery(Guid Id) : IRequest<AssetDto>;
