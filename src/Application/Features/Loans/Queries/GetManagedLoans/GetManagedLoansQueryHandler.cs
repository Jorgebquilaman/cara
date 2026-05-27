using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Queries.GetManagedLoans;

public class GetManagedLoansQueryHandler : IRequestHandler<GetManagedLoansQuery, IReadOnlyList<LoanDto>>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public GetManagedLoansQueryHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<LoanDto>> Handle(GetManagedLoansQuery request, CancellationToken cancellationToken)
    {
        var loans = await _loanRepository.GetManagedLoansAsync(cancellationToken);
        return _mapper.Map<List<LoanDto>>(loans);
    }
}
