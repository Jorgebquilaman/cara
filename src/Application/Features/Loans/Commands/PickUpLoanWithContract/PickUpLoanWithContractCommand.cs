using System.Text.RegularExpressions;
using Application.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Loans.Commands.PickUpLoanWithContract;

public record PickUpLoanWithContractCommand(Guid LoanId) : IRequest<ContractDto>
{
    public Guid? TemplateId { get; init; }
}

public class PickUpLoanWithContractCommandHandler : IRequestHandler<PickUpLoanWithContractCommand, ContractDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IContractRepository _contractRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AutoMapper.IMapper _mapper;

    public PickUpLoanWithContractCommandHandler(
        ILoanRepository loanRepository,
        IContractRepository contractRepository,
        IUnitOfWork unitOfWork,
        AutoMapper.IMapper mapper)
    {
        _loanRepository = loanRepository;
        _contractRepository = contractRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ContractDto> Handle(PickUpLoanWithContractCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
            throw new KeyNotFoundException($"Loan {request.LoanId} not found.");

        loan.PickUp();
        _loanRepository.Update(loan);

        var user = loan.User;
        var asset = loan.Asset;
        var contractCode = $"CONT-{asset.Code}-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
        var userFullName = $"{user.FirstName} {user.LastName}";
        var prendaStr = loan.Prenda > 0 ? $"$ {loan.Prenda:N2}" : "—";
        var obsStr = !string.IsNullOrWhiteSpace(loan.Observations) ? loan.Observations : "—";

        string content;

        if (request.TemplateId.HasValue)
        {
            var template = await _contractRepository.GetByIdAsync(request.TemplateId.Value, cancellationToken);
            if (template?.Content == null)
                throw new InvalidOperationException("Template contract not found or has no content.");

            content = FillTemplate(template.Content, new()
            {
                ["ContractCode"] = contractCode,
                ["Today"] = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm") + " hs",
                ["StudentName"] = userFullName,
                ["StudentDNI"] = user.Dni,
                ["StudentEmail"] = user.InstitutionalEmail.Value,
                ["AssetCode"] = asset.Code,
                ["AssetName"] = asset.Name,
                ["AssetCategory"] = asset.Category,
                ["AssetDescription"] = asset.Description ?? "—",
                ["StartDate"] = loan.Period.Start.ToString("dd/MM/yyyy HH:mm") + " hs",
                ["EndDate"] = loan.Period.End.ToString("dd/MM/yyyy HH:mm") + " hs",
                ["Prenda"] = prendaStr,
                ["Observations"] = obsStr,
            });
        }
        else
        {
            content = $@"# Contrato de Préstamo de Equipamiento

**Código:** {contractCode}
**Fecha de emisión:** {DateTime.UtcNow:dd/MM/yyyy HH:mm} hs

---

## Datos del Estudiante

| Campo | Valor |
|-------|-------|
| Nombre completo | {userFullName} |
| DNI | {user.Dni} |
| Email | {user.InstitutionalEmail} |

## Equipamiento Retirado

| Campo | Valor |
|-------|-------|
| Código | {asset.Code} |
| Nombre | {asset.Name} |
| Categoría | {asset.Category} |
| Descripción | {asset.Description ?? "—"} |

## Período del Préstamo

| Campo | Valor |
|-------|-------|
| Fecha de inicio | {loan.Period.Start:dd/MM/yyyy HH:mm} hs |
| Fecha de devolución | {loan.Period.End:dd/MM/yyyy HH:mm} hs |
| Prenda | {prendaStr} |
| Observaciones | {obsStr} |

---

## Términos y Condiciones

1. El estudiante se compromete a devolver el equipamiento en la fecha y hora acordadas.
2. El equipamiento debe ser devuelto en el mismo estado en que fue recibido.
3. En caso de daño, pérdida o robo, el estudiante será responsable del costo de reparación o reposición.
4. La prenda será devuelta al momento de la devolución del equipamiento, siempre que no haya daños ni novedades.
5. El incumplimiento de los plazos de devolución podrá resultar en sanciones según el reglamento institucional.
6. Al retirar el equipamiento, el estudiante declara haber recibido el mismo en buen estado.

---

## Firmas

_________________________          _________________________
**Estudiante**                       **Administrativo**

{userFullName}
";
        }

        var contract = new Contract(
            contractCode,
            $"Préstamo de {asset.Name} - {userFullName}",
            content,
            $"{userFullName} ({user.InstitutionalEmail})",
            loan.Period.Start,
            loan.Period.End,
            null);

        _contractRepository.Add(contract);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ContractDto>(contract);
    }

    private static string FillTemplate(string template, Dictionary<string, string> values)
    {
        return Regex.Replace(template, @"\{\{(\w+)\}\}", match =>
        {
            var key = match.Groups[1].Value;
            return values.TryGetValue(key, out var value) ? value : match.Value;
        });
    }
}
