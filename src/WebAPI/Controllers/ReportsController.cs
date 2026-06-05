using Application.Common.Interfaces;
using Application.DTOs;
using Application.Services;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    private readonly IApplicationDbContext _context;

    public ReportsController(
        IExportService exportService,
        ILoanRepository loanRepository,
        IAssetRepository assetRepository,
        ISanctionRepository sanctionRepository,
        IAuditLogRepository auditLogRepository,
        IUserRepository userRepository,
        IIncidentRepository incidentRepository,
        IApplicationDbContext context)
    {
        _exportService = exportService;
        _loanRepository = loanRepository;
        _assetRepository = assetRepository;
        _sanctionRepository = sanctionRepository;
        _auditLogRepository = auditLogRepository;
        _userRepository = userRepository;
        _incidentRepository = incidentRepository;
        _context = context;
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

        var ratedLoans = loans.Where(l => l.UserRating.HasValue).ToList();
        var userAvgRating = ratedLoans.Count != 0
            ? ratedLoans.Average(l => l.UserRating!.Value)
            : (double?)null;

        return Ok(new UserHistoryDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            InstitutionalEmail = user.InstitutionalEmail.Value,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            UserAverageRating = userAvgRating,
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

    [HttpGet("prenda-stats")]
    public async Task<IActionResult> GetPrendaStats()
    {
        var loans = await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Asset)
            .Where(l => l.Prenda > 0)
            .OrderByDescending(l => l.RequestedAt)
            .ToListAsync();

        var totalPrenda = loans.Sum(l => l.Prenda);
        var totalWithPrenda = loans.Count;
        var avgPrenda = totalWithPrenda > 0 ? Math.Round(loans.Average(l => l.Prenda), 2) : 0;
        var saldoPendiente = totalPrenda - loans.Where(l => l.PrendaReturned).Sum(l => l.Prenda);

        var recent = loans.Take(10).Select(l => new
        {
            Id = l.Id,
            AssetCode = l.Asset.Code,
            AssetName = l.Asset.Name,
            UserName = $"{l.User.FirstName} {l.User.LastName}",
            Prenda = l.Prenda,
            PrendaReturned = l.PrendaReturned,
            PrendaReturnedAt = l.PrendaReturnedAt,
            RequestedAt = l.RequestedAt,
            Status = l.Status.ToString()
        }).ToList();

        return Ok(new
        {
            TotalPrenda = totalPrenda,
            TotalWithPrenda = totalWithPrenda,
            AveragePrenda = avgPrenda,
            SaldoPendiente = saldoPendiente,
            Recent = recent
        });
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var loans = await _loanRepository.GetAllLoansAsync();
        var assets = await _assetRepository.GetAllAsync();
        var users = await _userRepository.GetAllAsync();
        
        var mostRequested = loans.GroupBy(l => l.Asset.Name)
            .Select(g => new { Name = g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .Take(10);

        var topUsedAssets = loans.GroupBy(l => new { l.Asset.Code, l.Asset.Name, l.Asset.Description })
            .Select(g => new { g.Key.Code, g.Key.Name, g.Key.Description, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .Take(10);

        var deptStats = loans.Where(l => l.User.Career != null)
            .GroupBy(l => l.User.Career!.Department.Name)
            .Select(g => new { Department = g.Key, Count = g.Count() });

        var careerStats = loans.Where(l => l.User.Career != null)
            .GroupBy(l => l.User.Career!.Name)
            .Select(g => new { Career = g.Key, Count = g.Count() });

        var usageTime = loans.Where(l => l.ReturnedAt.HasValue)
            .GroupBy(l => l.Asset.Name)
            .Select(g => new { 
                Asset = g.Key, 
                AverageHours = g.Average(l => (l.ReturnedAt!.Value - l.Period.Start).TotalHours) 
            })
            .OrderByDescending(g => g.AverageHours)
            .Take(10);

        var surveys = await _context.SatisfactionSurveys
            .Include(s => s.Loan).ThenInclude(l => l.Asset)
            .ToListAsync();

        var totalSurveys = surveys.Count;
        var avgOverall = totalSurveys > 0 ? surveys.Average(s => s.OverallRating) : 0;
        var avgService = totalSurveys > 0 ? surveys.Average(s => s.ServiceRating) : 0;
        var avgTime = totalSurveys > 0 ? surveys.Average(s => s.RequestTimeRating) : 0;
        var avgQuality = totalSurveys > 0 ? surveys.Average(s => s.AssetQualityRating) : 0;

        var surveyByAsset = surveys.GroupBy(s => s.Loan.Asset.Name)
            .Select(g => new { Asset = g.Key, Count = g.Count(), AvgRating = Math.Round(g.Average(s => s.OverallRating), 1) })
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToList();

        var incidents = await _context.Incidents
            .Include(i => i.Loan).ThenInclude(l => l.Asset)
            .ToListAsync();

        var incidentStats = new
        {
            TotalIncidents = incidents.Count,
            UnresolvedIncidents = incidents.Count(i => !i.IsResolved),
            AssetsWithIncidents = incidents.Select(i => i.Loan.Asset.Name).Distinct().Count(),
            TopIncidentAssets = incidents
                .GroupBy(i => new { i.Loan.Asset.Name, i.Loan.Asset.Code })
                .Select(g => new { Asset = $"{g.Key.Code} - {g.Key.Name}", Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(10)
                .ToList()
        };

        return Ok(new { 
            KPIs = new {
                TotalAssets = assets.Count,
                ActiveLoans = loans.Count(l => l.Status == Domain.Enums.LoanStatus.Active),
                TotalUsers = users.Count,
                TotalSurveys = totalSurveys,
                AvgOverallRating = Math.Round(avgOverall, 1),
                AvgServiceRating = Math.Round(avgService, 1),
                AvgRequestTimeRating = Math.Round(avgTime, 1),
                AvgAssetQualityRating = Math.Round(avgQuality, 1)
            },
            MostRequested = mostRequested, 
            TopUsedAssets = topUsedAssets,
            DepartmentStats = deptStats, 
            CareerStats = careerStats,
            UsageTime = usageTime,
            SurveyByAsset = surveyByAsset,
            IncidentStats = incidentStats
        });
    }

    [HttpGet("surveys/csv")]
    public async Task<IActionResult> ExportSurveysCsv()
    {
        var surveys = await _context.SatisfactionSurveys
            .Include(s => s.Loan).ThenInclude(l => l.User)
            .Include(s => s.Loan).ThenInclude(l => l.Asset)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var rows = surveys.Select(s => new
        {
            Fecha = s.CreatedAt.ToString("yyyy-MM-dd"),
            Usuario = $"{s.Loan.User.FirstName} {s.Loan.User.LastName}",
            Email = s.Loan.User.InstitutionalEmail.Value,
            Activo = s.Loan.Asset.Name,
            ValoracionGeneral = s.OverallRating,
            Atencion = s.ServiceRating,
            TiempoSolicitud = s.RequestTimeRating,
            CalidadActivo = s.AssetQualityRating,
            Comentarios = s.Comments ?? ""
        }).ToList();

        var bytes = await _exportService.ExportToCsvAsync(rows, "surveys");
        return File(bytes, "text/csv", "encuestas.csv");
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
