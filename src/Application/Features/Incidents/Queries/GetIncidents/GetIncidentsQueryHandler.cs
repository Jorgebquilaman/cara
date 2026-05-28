using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Incidents.Queries.GetIncidents;

public class GetIncidentsQueryHandler : IRequestHandler<GetIncidentsQuery, IReadOnlyList<IncidentDto>>
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IMapper _mapper;

    public GetIncidentsQueryHandler(IIncidentRepository incidentRepository, IMapper mapper)
    {
        _incidentRepository = incidentRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<IncidentDto>> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
    {
        var incidents = await _incidentRepository.GetAllAsync(cancellationToken);
        var dtos = _mapper.Map<List<IncidentDto>>(incidents);

        foreach (var dto in dtos)
        {
            Console.WriteLine($"Incident {dto.Id}: Asset={dto.AssetName}, Code={dto.AssetCode}");
        }

        return dtos;
    }
}
