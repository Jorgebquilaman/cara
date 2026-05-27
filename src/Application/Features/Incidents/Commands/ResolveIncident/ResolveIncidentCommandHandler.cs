using Domain.Interfaces;
using MediatR;

namespace Application.Features.Incidents.Commands.ResolveIncident;

public class ResolveIncidentCommandHandler : IRequestHandler<ResolveIncidentCommand>
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ResolveIncidentCommandHandler(
        IIncidentRepository incidentRepository,
        IUnitOfWork unitOfWork)
    {
        _incidentRepository = incidentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ResolveIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _incidentRepository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
            throw new KeyNotFoundException($"Incident {request.Id} not found.");

        incident.Resolve();
        _incidentRepository.Update(incident);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
