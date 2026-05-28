using Application.Common.Interfaces;
using Application.DTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reservations.Commands.CreateReservation;

public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IAssetRepository _assetRepository;
    private readonly IApplicationDbContext _context;
    private readonly IIncidentRepository _incidentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public CreateReservationCommandHandler(
        IAssetRepository assetRepository, 
        IApplicationDbContext context, 
        IIncidentRepository incidentRepository,
        IUnitOfWork unitOfWork, 
        IMapper mapper,
        INotificationService notificationService)
    {
        _assetRepository = assetRepository;
        _context = context;
        _incidentRepository = incidentRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationService = notificationService;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken);
        if (asset == null)
            throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

        if (await _incidentRepository.HasUnresolvedIncidentsAsync(request.AssetId, cancellationToken))
            throw new InvalidOperationException("El activo no puede ser reservado porque tiene incidentes sin resolver.");

        var startDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

        if ((endDate - startDate).TotalDays > asset.MaxLoanDays)
            throw new LoanPeriodException($"El período máximo del activo es de {asset.MaxLoanDays} días.");

        var hasConflict = await _context.Reservations
            .AnyAsync(r =>
                r.AssetId == request.AssetId &&
                r.Status == ReservationStatus.Confirmed &&
                r.StartDate < endDate &&
                r.EndDate > startDate,
                cancellationToken);

        if (hasConflict)
            throw new AssetNotAvailableForDateException(request.AssetId, startDate, endDate);

        var reservation = new Reservation(
            request.AssetId,
            request.UserId,
            startDate,
            endDate,
            request.Space);

        _context.Reservations.Add(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyReservationCreatedAsync(reservation, cancellationToken);

        return _mapper.Map<ReservationDto>(reservation);
    }
}