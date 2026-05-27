using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Sanctions.Queries.GetAllSanctions;

public class GetAllSanctionsQueryHandler : IRequestHandler<GetAllSanctionsQuery, IReadOnlyList<SanctionDto>>
{
    private readonly ISanctionRepository _sanctionRepository;
    private readonly IMapper _mapper;

    public GetAllSanctionsQueryHandler(ISanctionRepository sanctionRepository, IMapper mapper)
    {
        _sanctionRepository = sanctionRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<SanctionDto>> Handle(GetAllSanctionsQuery request, CancellationToken cancellationToken)
    {
        var sanctions = await _sanctionRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<SanctionDto>>(sanctions);
    }
}
