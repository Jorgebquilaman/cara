using Application.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Contracts.Queries.GetAllContracts;

public class GetAllContractsQueryHandler : IRequestHandler<GetAllContractsQuery, IReadOnlyList<ContractDto>>
{
    private readonly IContractRepository _contractRepository;
    private readonly IMapper _mapper;

    public GetAllContractsQueryHandler(IContractRepository contractRepository, IMapper mapper)
    {
        _contractRepository = contractRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ContractDto>> Handle(GetAllContractsQuery request, CancellationToken cancellationToken)
    {
        var contracts = await _contractRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<ContractDto>>(contracts);
    }
}
