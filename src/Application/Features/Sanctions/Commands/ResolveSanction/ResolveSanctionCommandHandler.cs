using Domain.Interfaces;
using MediatR;

namespace Application.Features.Sanctions.Commands.ResolveSanction;

public class ResolveSanctionCommandHandler : IRequestHandler<ResolveSanctionCommand>
{
    private readonly ISanctionRepository _sanctionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ResolveSanctionCommandHandler(
        ISanctionRepository sanctionRepository,
        IUnitOfWork unitOfWork)
    {
        _sanctionRepository = sanctionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ResolveSanctionCommand request, CancellationToken cancellationToken)
    {
        var sanction = await _sanctionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (sanction == null)
            throw new KeyNotFoundException($"Sanction {request.Id} not found.");

        if (!sanction.IsActive)
            throw new InvalidOperationException("Sanction is already resolved.");

        sanction.Resolve();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
