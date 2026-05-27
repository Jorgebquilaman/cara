using Application.DTOs;
using MediatR;

namespace Application.Features.Sanctions.Commands.CreateSanction;

public record CreateSanctionCommand : IRequest<SanctionDto>
{
    public Guid UserId { get; init; }
    public string Reason { get; init; }
    public string? AttachmentUrl { get; init; }
    public DateTime ExpiresAt { get; init; }
}
