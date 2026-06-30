using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Contracts.Queries.GetContractById;

public class GetContractByIdQueryHandler : IRequestHandler<GetContractByIdQuery, ContractDto>
{
    private readonly IContractRepository _contractRepository;
    private readonly IMapper _mapper;

    public GetContractByIdQueryHandler(IContractRepository contractRepository, IMapper mapper)
    {
        _contractRepository = contractRepository;
        _mapper = mapper;
    }

    public async Task<ContractDto> Handle(GetContractByIdQuery request, CancellationToken cancellationToken)
    {
        var contract = await _contractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null)
            throw new KeyNotFoundException($"Contract {request.Id} not found.");

        return _mapper.Map<ContractDto>(contract);
    }
}
