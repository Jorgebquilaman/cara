using Application.DTOs;
using Application.Services;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ReportsController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly ILoanRepository _loanRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly ISanctionRepository _sanctionRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUserRepository _userRepository;
    private readonly IIncidentRepository _incidentRepository;

    public ReportsController(
        IExportService exportService,
        ILoanRepository loanRepository,
        IAssetRepository assetRepository,
        ISanctionRepository sanctionRepository,
        IAuditLogRepository auditLogRepository,
        IUserRepository userRepository,
        IIncidentRepository incidentRepository)
    {
        _exportService = exportService;
        _loanRepository = loanRepository;
        _assetRepository = assetRepository;
        _sanctionRepository = sanctionRepository;
        _auditLogRepository = auditLogRepository;
        _userRepository = userRepository;
        _incidentRepository = incidentRepository;
    }

    [HttpGet("loans/csv")]
    public async Task<IActionResult> ExportLoansCsv()
    {
        var loans = await _loanRepository.GetActiveLoansAsync();
        var bytes = await _exportService.ExportToCsvAsync(loans, "loans");
        return File(bytes, "text/csv", "prestamos-activos.csv");
    }

    [HttpGet("assets/by-category/csv")]
    public async Task<IActionResult> ExportAssetsByCategoryCsv()
    {
        var assets = await _assetRepository.GetAllAsync();
        var bytes = await _exportService.ExportToCsvAsync(assets, "assets");
        return File(bytes, "text/csv", "activos-por-categoria.csv");
    }

    [HttpGet("sanctions/active/csv")]
    public async Task<IActionResult> ExportActiveSanctionsCsv()
    {
        var sanctions = await _sanctionRepository.GetAllActiveAsync();
        var bytes = await _exportService.ExportToCsvAsync(sanctions, "sanctions");
        return File(bytes, "text/csv", "sanciones-activas.csv");
    }

    [HttpGet("audit/csv")]
    public async Task<IActionResult> ExportAuditLogCsv()
    {
        var logs = await _auditLogRepository.GetAllAsync();
        var bytes = await _exportService.ExportToCsvAsync(logs, "audit");
        return File(bytes, "text/csv", "auditoria.csv");
    }

    [HttpGet("user-history/{userId:guid}")]
    public async Task<ActionResult<UserHistoryDto>> GetUserHistory(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound("User not found");

        var loans = await _loanRepository.GetByUserAsync(userId);
        var sanctions = await _sanctionRepository.GetByUserAsync(userId);
        var incidents = await _incidentRepository.GetByUserIdAsync(userId);

        return Ok(new UserHistoryDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            InstitutionalEmail = user.InstitutionalEmail.Value,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            Loans = loans.Select(l => new LoanDto
            {
                Id = l.Id,
                AssetId = l.AssetId,
                AssetCode = l.Asset.Code,
                AssetName = l.Asset.Name,
                UserId = l.UserId,
                UserName = $"{l.User.FirstName} {l.User.LastName}",
                StartDate = l.Period.Start,
                DueDate = l.Period.End,
                Status = l.Status.ToString(),
                RequestedAt = l.RequestedAt,
                ApprovedAt = l.ApprovedAt,
                ReturnedAt = l.ReturnedAt,
                RejectionReason = l.RejectionReason,
            }).ToList(),
            Incidents = incidents.Select(i => new IncidentDto
            {
                Id = i.Id,
                LoanId = i.LoanId,
                Description = i.Description,
                PhotoUrl = i.PhotoUrl,
                ReportedAt = i.ReportedAt,
                IsResolved = i.IsResolved,
                ResolvedAt = i.ResolvedAt,
            }).ToList(),
            Sanctions = sanctions.Select(s => new SanctionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                Reason = s.Reason,
                IssuedAt = s.IssuedAt,
                ResolvedAt = s.ResolvedAt,
                IsActive = s.IsActive,
            }).ToList(),
        });
    }

    private class UserHistoryCsvRow
    {
        public string Type { get; set; }
        public string Date { get; set; }
        public string Status { get; set; }
        public string Asset { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string Detail { get; set; }
    }

    [HttpGet("user-history/{userId:guid}/csv")]
    public async Task<IActionResult> ExportUserHistoryCsv(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound("User not found");

        var loans = await _loanRepository.GetByUserAsync(userId);
        var sanctions = await _sanctionRepository.GetByUserAsync(userId);
        var incidents = await _incidentRepository.GetByUserIdAsync(userId);

        var rows = new List<UserHistoryCsvRow>();
        foreach (var l in loans)
        {
            rows.Add(new UserHistoryCsvRow
            {
                Type = "Préstamo",
                Date = l.RequestedAt.ToString("yyyy-MM-dd"),
                Status = l.Status.ToString(),
                Asset = l.Asset.Name,
                Start = l.Period.Start.ToString("yyyy-MM-dd"),
                End = l.Period.End.ToString("yyyy-MM-dd"),
                Detail = l.ReturnedAt?.ToString("yyyy-MM-dd") ?? "",
            });
        }
        foreach (var i in incidents)
        {
            rows.Add(new UserHistoryCsvRow
            {
                Type = "Incidente",
                Date = i.ReportedAt.ToString("yyyy-MM-dd"),
                Status = i.IsResolved ? "Resuelto" : "Pendiente",
                Asset = "",
                Start = "",
                End = "",
                Detail = i.Description,
            });
        }
        foreach (var s in sanctions)
        {
            rows.Add(new UserHistoryCsvRow
            {
                Type = "Sanción",
                Date = s.IssuedAt.ToString("yyyy-MM-dd"),
                Status = s.IsActive ? "Activa" : "Resuelta",
                Asset = "",
                Start = "",
                End = "",
                Detail = s.Reason,
            });
        }

        rows = rows.OrderByDescending(r => r.Date).ToList();
        var bytes = await _exportService.ExportToCsvAsync(rows, "user-history");
        return File(bytes, "text/csv", $"historial-{user.FirstName}-{user.LastName}.csv");
    }
}
