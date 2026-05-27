using Application.DTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Sanctions.Commands.CreateSanction;

public class CreateSanctionCommandHandler : IRequestHandler<CreateSanctionCommand, SanctionDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ISanctionRepository _sanctionRepository;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateSanctionCommandHandler(
        IUserRepository userRepository,
        ISanctionRepository sanctionRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _sanctionRepository = sanctionRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SanctionDto> Handle(CreateSanctionCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User {request.UserId} not found.");

        var expiresAt = DateTime.SpecifyKind(request.ExpiresAt, DateTimeKind.Utc);

        var sanction = new Sanction(request.UserId, request.Reason, expiresAt, request.AttachmentUrl);

        _sanctionRepository.Add(sanction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Re-fetch user to refresh navigation collections
        await _notificationService.NotifySanctionIssuedAsync(sanction, cancellationToken);

        return _mapper.Map<SanctionDto>(sanction);
    }
}
