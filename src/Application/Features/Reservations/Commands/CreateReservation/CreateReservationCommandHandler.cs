using Application.Common.Interfaces;
using Application.DTOs;
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
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateReservationCommandHandler(IAssetRepository assetRepository, IApplicationDbContext context, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _assetRepository = assetRepository;
        _context = context;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken);
        if (asset == null)
            throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

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

        return _mapper.Map<ReservationDto>(reservation);
    }
}
