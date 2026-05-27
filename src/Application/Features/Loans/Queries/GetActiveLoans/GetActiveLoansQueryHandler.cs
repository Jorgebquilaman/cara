using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Queries.GetActiveLoans;

public class GetActiveLoansQueryHandler : IRequestHandler<GetActiveLoansQuery, IReadOnlyList<LoanDto>>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public GetActiveLoansQueryHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<LoanDto>> Handle(GetActiveLoansQuery request, CancellationToken cancellationToken)
    {
        var loans = await _loanRepository.GetActiveLoansAsync(cancellationToken);
        return _mapper.Map<List<LoanDto>>(loans);
    }
}
