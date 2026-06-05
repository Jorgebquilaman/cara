using System.Security.Claims;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CalendarController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvents(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end,
        [FromQuery] Guid? assetId = null,
        [FromQuery] string? typeId = null,
        [FromQuery] string? eventStatus = null)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var loansQuery = _context.Loans
            .Include(l => l.Asset)
            .Include(l => l.User)
            .Where(l => l.Period.Start < end && l.Period.End > start);

        var reservationsQuery = _context.Reservations
            .Include(r => r.Asset)
            .Include(r => r.User)
            .Where(r => r.StartDate < end && r.EndDate > start);

        if (assetId.HasValue)
        {
            loansQuery = loansQuery.Where(l => l.AssetId == assetId.Value);
            reservationsQuery = reservationsQuery.Where(r => r.AssetId == assetId.Value);
        }

        if (!string.IsNullOrEmpty(typeId))
        {
            if (typeId == "Loan")
                reservationsQuery = reservationsQuery.Where(r => false);
            else if (typeId == "Reservation")
                loansQuery = loansQuery.Where(l => false);
        }

        if (!string.IsNullOrEmpty(eventStatus))
        {
            loansQuery = loansQuery.Where(l =>
                l.Status == LoanStatus.Pending && eventStatus == "Pendiente" ||
                l.Status == LoanStatus.Approved && eventStatus == "Aprobado" ||
                l.Status == LoanStatus.Active && eventStatus == "Activo" ||
                l.Status == LoanStatus.Overdue && eventStatus == "Vencido" ||
                l.Status == LoanStatus.Returned && eventStatus == "Devuelto" ||
                l.Status == LoanStatus.Rejected && eventStatus == "Rechazado");

            reservationsQuery = reservationsQuery.Where(r =>
                r.Status == ReservationStatus.Pending && eventStatus == "Pendiente" ||
                r.Status == ReservationStatus.Confirmed && eventStatus == "Confirmada" ||
                r.Status == ReservationStatus.Cancelled && eventStatus == "Cancelada" ||
                r.Status == ReservationStatus.Completed && eventStatus == "Completada");
        }

        if (userRole != "Admin" && userRole != "Staff")
        {
            loansQuery = loansQuery.Where(l => l.UserId == userId);
            reservationsQuery = reservationsQuery.Where(r => r.UserId == userId);
        }

        var loans = await loansQuery.ToListAsync();
        var reservations = await reservationsQuery.ToListAsync();

        var events = new List<object>();

        foreach (var l in loans)
        {
            var status = l.Status switch
            {
                LoanStatus.Pending => "Pendiente",
                LoanStatus.Approved => "Aprobado",
                LoanStatus.Active => "Activo",
                LoanStatus.Overdue => "Vencido",
                LoanStatus.Returned => "Devuelto",
                LoanStatus.Rejected => "Rechazado",
                _ => l.Status.ToString()
            };

            events.Add(new
            {
                id = $"loan-{l.Id}",
                title = l.Asset.Name,
                start = l.Period.Start,
                end = l.Period.End,
                type = "Préstamo",
                typeId = "Loan",
                status,
                assetId = l.AssetId,
                assetName = l.Asset.Name,
                userName = $"{l.User.FirstName} {l.User.LastName}",
                userId = l.UserId,
            });
        }

        foreach (var r in reservations)
        {
            var status = r.Status switch
            {
                ReservationStatus.Pending => "Pendiente",
                ReservationStatus.Confirmed => "Confirmada",
                ReservationStatus.Cancelled => "Cancelada",
                ReservationStatus.Completed => "Completada",
                _ => r.Status.ToString()
            };

            events.Add(new
            {
                id = $"reservation-{r.Id}",
                title = $"{r.Asset.Name} ({r.Space})",
                start = r.StartDate,
                end = r.EndDate,
                type = "Reserva",
                typeId = "Reservation",
                status,
                assetId = r.AssetId,
                assetName = r.Asset.Name,
                userName = $"{r.User.FirstName} {r.User.LastName}",
                userId = r.UserId,
            });
        }

        return Ok(events.OrderBy(e => ((DateTime)((dynamic)e).start)));
    }
}
