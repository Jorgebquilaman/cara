using Application.DTOs;
using MediatR;

namespace Application.Features.Contracts.Commands.CreateContract;

public record CreateContractCommand : IRequest<ContractDto>
{
    public string Code { get; init; }
    public string Title { get; init; }
    public string? Content { get; init; }
    public string? Provider { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? FileUrl { get; init; }
}
