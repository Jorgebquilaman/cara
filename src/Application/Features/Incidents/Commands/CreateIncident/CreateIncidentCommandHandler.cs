using Application.DTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Incidents.Commands.CreateIncident;

public class CreateIncidentCommandHandler : IRequestHandler<CreateIncidentCommand, IncidentDto>
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly ILoanRepository _loanRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IIncidentAlertSender _incidentAlertSender;

    public CreateIncidentCommandHandler(
        IIncidentRepository incidentRepository,
        ILoanRepository loanRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IIncidentAlertSender incidentAlertSender)
    {
        _incidentRepository = incidentRepository;
        _loanRepository = loanRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _incidentAlertSender = incidentAlertSender;
    }

    public async Task<IncidentDto> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Description))
            throw new InvalidOperationException("La descripción del incidente es obligatoria.");

        Incident incident;

        if (request.LoanId != null)
        {
            // Incidente de préstamo: derivar el activo del préstamo si no viene explícito
            var assetId = request.AssetId;
            if (assetId == null)
            {
                var loan = await _loanRepository.GetByIdAsync(request.LoanId.Value, cancellationToken);
                assetId = loan?.AssetId;
            }
            incident = Incident.Create(request.LoanId.Value, assetId, request.Description, request.ReportedBy, request.PhotoUrl);
        }
        else if (request.AssetId != null)
        {
            // Incidente directo contra el activo (sin préstamo asociado),
            // por ejemplo: se rompió por el paso del tiempo mientras estaba guardado.
            incident = Incident.ForAsset(request.AssetId.Value, request.Description, request.ReportedBy, request.PhotoUrl);
        }
        else
        {
            throw new InvalidOperationException("Debe indicar el activo o el préstamo asociado al incidente.");
        }

        _incidentRepository.Add(incident);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Aviso por email al casillero configurado (activo roto/robado)
        await _incidentAlertSender.SendAsync(incident.Id, cancellationToken);

        return _mapper.Map<IncidentDto>(incident);
    }
}
