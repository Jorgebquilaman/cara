using Application.DTOs;
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

    public CreateIncidentCommandHandler(
        IIncidentRepository incidentRepository,
        ILoanRepository loanRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _incidentRepository = incidentRepository;
        _loanRepository = loanRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IncidentDto> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        var incident = new Incident(
            request.LoanId,
            request.Description,
            request.ReportedBy,
            request.PhotoUrl);

        _incidentRepository.Add(incident);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<IncidentDto>(incident);
    }
}
