using Application.DTOs;
using AutoMapper;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Contracts.Commands.UpdateContract;

public class UpdateContractCommandHandler : IRequestHandler<UpdateContractCommand, ContractDto>
{
    private readonly IContractRepository _contractRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateContractCommandHandler(
        IContractRepository contractRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _contractRepository = contractRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ContractDto> Handle(UpdateContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _contractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null)
            throw new KeyNotFoundException($"Contract {request.Id} not found.");

        var status = Enum.Parse<ContractStatus>(request.Status);

        contract.Update(
            request.Title,
            request.Content,
            request.Provider,
            request.StartDate,
            request.EndDate,
            request.FileUrl,
            status);

        _contractRepository.Update(contract);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ContractDto>(contract);
    }
}
