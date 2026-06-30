using Application.DTOs;
using MediatR;

namespace Application.Features.Contracts.Queries.GetAllContracts;

public record GetAllContractsQuery : IRequest<IReadOnlyList<ContractDto>>;
