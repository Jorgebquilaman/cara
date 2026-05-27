using Application.DTOs;
using MediatR;

namespace Application.Features.Incidents.Queries.GetIncidents;

public record GetIncidentsQuery : IRequest<IReadOnlyList<IncidentDto>>;
