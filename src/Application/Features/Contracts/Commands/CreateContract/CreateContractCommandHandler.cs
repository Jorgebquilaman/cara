using Application.DTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Contracts.Commands.CreateContract;

public class CreateContractCommandHandler : IRequestHandler<CreateContractCommand, ContractDto>
{
    private readonly IContractRepository _contractRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateContractCommandHandler(
        IContractRepository contractRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _contractRepository = contractRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ContractDto> Handle(CreateContractCommand request, CancellationToken cancellationToken)
    {
        var contract = new Contract(
            request.Code,
            request.Title,
            request.Content,
            request.Provider,
            request.StartDate,
            request.EndDate,
            request.FileUrl);

        _contractRepository.Add(contract);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ContractDto>(contract);
    }
}
