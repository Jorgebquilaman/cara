using Application.DTOs;
using MediatR;

namespace Application.Features.Sanctions.Queries.GetAllSanctions;

public record GetAllSanctionsQuery : IRequest<IReadOnlyList<SanctionDto>>;
