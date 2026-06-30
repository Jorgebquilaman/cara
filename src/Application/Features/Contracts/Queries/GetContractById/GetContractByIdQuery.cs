using Application.DTOs;
using MediatR;

namespace Application.Features.Contracts.Queries.GetContractById;

public record GetContractByIdQuery(Guid Id) : IRequest<ContractDto>;
