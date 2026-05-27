using Application.DTOs;
using MediatR;

namespace Application.Features.Incidents.Commands.CreateIncident;

public record CreateIncidentCommand : IRequest<IncidentDto>
{
    public Guid LoanId { get; init; }
    public Guid ReportedBy { get; init; }
    public string Description { get; init; }
    public string? PhotoUrl { get; init; }
}
