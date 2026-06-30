using Application.DTOs;
using MediatR;

namespace Application.Features.Contracts.Commands.UpdateContract;

public record UpdateContractCommand : IRequest<ContractDto>
{
    public Guid Id { get; init; }
    public string Title { get; init; }
    public string? Content { get; init; }
    public string? Provider { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? FileUrl { get; init; }
    public string Status { get; init; }
}
