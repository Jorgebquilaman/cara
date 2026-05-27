using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Queries.GetPastDueLoans;

public class GetPastDueLoansQueryHandler : IRequestHandler<GetPastDueLoansQuery, IReadOnlyList<LoanDto>>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public GetPastDueLoansQueryHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<LoanDto>> Handle(GetPastDueLoansQuery request, CancellationToken cancellationToken)
    {
        var loans = await _loanRepository.GetPastDueLoansAsync(cancellationToken);
        return _mapper.Map<List<LoanDto>>(loans);
    }
}
