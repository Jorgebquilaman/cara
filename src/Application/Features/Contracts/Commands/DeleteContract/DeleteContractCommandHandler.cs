using Domain.Interfaces;
using MediatR;

namespace Application.Features.Contracts.Commands.DeleteContract;

public class DeleteContractCommandHandler : IRequestHandler<DeleteContractCommand>
{
    private readonly IContractRepository _contractRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteContractCommandHandler(
        IContractRepository contractRepository,
        IUnitOfWork unitOfWork)
    {
        _contractRepository = contractRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _contractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null)
            throw new KeyNotFoundException($"Contract {request.Id} not found.");

        contract.SoftDelete();
        _contractRepository.Update(contract);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
