using MediatR;

namespace Application.Features.Incidents.Commands.ResolveIncident;

public record ResolveIncidentCommand(Guid Id) : IRequest;
