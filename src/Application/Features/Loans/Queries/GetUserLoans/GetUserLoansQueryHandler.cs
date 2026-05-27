using Application.DTOs;
using AutoMapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Queries.GetUserLoans;

public class GetUserLoansQueryHandler : IRequestHandler<GetUserLoansQuery, IReadOnlyList<LoanDto>>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public GetUserLoansQueryHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<LoanDto>> Handle(GetUserLoansQuery request, CancellationToken cancellationToken)
    {
        var loans = await _loanRepository.GetByUserAsync(request.UserId, cancellationToken);
        return _mapper.Map<List<LoanDto>>(loans);
    }
}
