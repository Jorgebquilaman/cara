using Application.DTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Loans.Commands.CreateLoan;

public class CreateLoanCommandHandler : IRequestHandler<CreateLoanCommand, LoanDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly IUserRepository _userRepository;
    private readonly IIncidentRepository _incidentRepository;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateLoanCommandHandler(
        ILoanRepository loanRepository,
        IAssetRepository assetRepository,
        IUserRepository userRepository,
        IIncidentRepository incidentRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _loanRepository = loanRepository;
        _assetRepository = assetRepository;
        _userRepository = userRepository;
        _incidentRepository = incidentRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<LoanDto> Handle(CreateLoanCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User {request.UserId} not found.");

        if (!user.CanRequestLoan())
        {
            if (user.HasActiveSanctions)
                throw new UserSanctionedException(user.Id);

            throw new LoanLimitExceededException(user.ActiveLoanCount, user.MaxConcurrentLoans);
        }

        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken);
        if (asset == null)
            throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

        if (await _incidentRepository.HasUnresolvedIncidentsAsync(request.AssetId, cancellationToken))
            throw new InvalidOperationException("El activo no puede ser prestado porque tiene incidentes sin resolver.");

        var startUtc = DateTime.SpecifyKind(request.StartDate.AddHours(3), DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(request.DueDate.AddHours(3), DateTimeKind.Utc);

        if (startUtc < DateTime.UtcNow.AddDays(-1))
            throw new LoanPeriodException("Start date cannot be in the past");

        var period = new LoanPeriod(startUtc, endUtc);

        if ((endUtc - startUtc).TotalDays > asset.MaxLoanDays)
            throw new LoanPeriodException($"El período máximo del activo es de {asset.MaxLoanDays} días.");

        var hasOverlap = await _loanRepository.HasOverlappingActiveLoanAsync(
            request.AssetId, startUtc, endUtc, cancellationToken);

        var loan = new Loan(request.AssetId, request.UserId, period, request.Observations, request.Prenda);

        _loanRepository.Add(loan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyNewLoanRequestAsync(loan, cancellationToken);

        var dto = _mapper.Map<LoanDto>(loan);
        dto.Message = hasOverlap
            ? "El activo está actualmente prestado. Se tratará de tenerlo disponible para la fecha solicitada."
            : "El activo está disponible. Podés pasar a retirarlo cuando el préstamo sea aprobado.";

        return dto;
    }
}