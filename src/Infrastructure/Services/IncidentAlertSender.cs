using Application.Common.Interfaces;
using Application.Services;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

/// <summary>
/// Envía un email con todos los datos del incidente al casillero configurado
/// en Configuración de Email (IncidentsEmail): activos rotos, robados o dañados.
/// Se invoca cuando se reporta un incidente o cuando se devuelve un activo con novedades.
/// </summary>
public class IncidentAlertSender : IIncidentAlertSender
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEmailSettingRepository _emailSettingRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<IncidentAlertSender> _logger;

    public IncidentAlertSender(
        ApplicationDbContext context,
        IEmailService emailService,
        IEmailSettingRepository emailSettingRepository,
        IConfiguration configuration,
        ILogger<IncidentAlertSender> logger)
    {
        _context = context;
        _emailService = emailService;
        _emailSettingRepository = emailSettingRepository;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(Guid incidentId, CancellationToken cancellationToken = default)
    {
        var settings = await _emailSettingRepository.GetAsync(cancellationToken);
        var destination = settings?.IncidentsEmail;
        if (string.IsNullOrWhiteSpace(destination))
        {
            _logger.LogInformation("Incident alert skipped: no IncidentsEmail configured.");
            return;
        }

        var incident = await _context.Incidents
            .Include(i => i.Asset)
            .Include(i => i.Loan)
            .ThenInclude(l => l.Asset)
            .Include(i => i.Loan)
            .ThenInclude(l => l.User)
            .FirstOrDefaultAsync(i => i.Id == incidentId, cancellationToken);

        if (incident == null)
            return;

        var reportedByUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == incident.ReportedBy, cancellationToken);

        var asset = incident.Asset ?? incident.Loan?.Asset;
        var loan = incident.Loan;
        var frontendUrl = _configuration["FrontendUrl"] ?? string.Empty;

        var source = loan != null
            ? $"Devolución del préstamo (Usuario: {loan.User?.FirstName} {loan.User?.LastName} — {loan.User?.InstitutionalEmail})"
            : "Reporte directo de usuario";

        var photoHtml = !string.IsNullOrWhiteSpace(incident.PhotoUrl)
            ? $"<p><strong>Foto de evidencia:</strong> <a href='{frontendUrl}{incident.PhotoUrl}'>{incident.PhotoUrl}</a></p>"
            : string.Empty;

        var loanRows = loan != null
            ? $@"
            <tr><td><strong>Préstamo</strong></td><td>Inicio: {loan.Period.Start:dd/MM/yyyy HH:mm} — Devolución comprometida: {loan.Period.End:dd/MM/yyyy HH:mm}</td></tr>
            <tr><td><strong>Retirado por</strong></td><td>{loan.User?.FirstName} {loan.User?.LastName} ({loan.User?.InstitutionalEmail}) — DNI {loan.User?.Dni}</td></tr>
            <tr><td><strong>Prenda</strong></td><td>{(loan.Prenda > 0 ? $"$ {loan.Prenda:N2}" : "sin prenda")}</td></tr>"
            : string.Empty;

        var subject = $"⚠ Incidente de activo: {asset?.Name} ({asset?.Code})";
        var body = $@"
            <div style='font-family:Inter,sans-serif;max-width:640px;margin:0 auto'>
                <div style='background:#D13B3B;padding:20px;border-radius:12px 12px 0 0'>
                    <h1 style='color:#fff;font-size:18px;margin:0;font-weight:700'>⚠ Reporte de incidente de activo</h1>
                </div>
                <div style='padding:24px;background:#f9f9f9;border:1px solid #e0e0e0;border-radius:0 0 12px 12px'>
                    <table style='border-collapse:collapse;width:100%;font-size:14px'>
                        <tr><td style='padding:6px 8px;color:#666;width:160px'><strong>Activo</strong></td><td>{asset?.Name}</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Código</strong></td><td>{asset?.Code}</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Categoría</strong></td><td>{asset?.Category}</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Departamento</strong></td><td>{asset?.Department}</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Ubicación</strong></td><td>{asset?.Location}</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Observaciones del activo</strong></td><td>{asset?.Observations ?? "—"}</td></tr>
                        {loanRows}
                        <tr><td style='padding:6px 8px;color:#666'><strong>Descripción del incidente</strong></td><td>{System.Net.WebUtility.HtmlEncode(incident.Description)}</td></tr>
                        {photoHtml}
                        <tr><td style='padding:6px 8px;color:#666'><strong>Reportado por</strong></td><td>{reportedByUser?.FirstName} {reportedByUser?.LastName} ({reportedByUser?.InstitutionalEmail})</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Fecha del reporte</strong></td><td>{incident.ReportedAt:dd/MM/yyyy HH:mm} hs</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>Origen</strong></td><td>{source}</td></tr>
                        <tr><td style='padding:6px 8px;color:#666'><strong>ID del incidente</strong></td><td>{incident.Id}</td></tr>
                    </table>
                    <p style='margin-top:20px;font-size:13px;color:#666'>
                        Este aviso se genera automáticamente desde el sistema CARA cuando se reporta un incidente
                        o cuando se devuelve un activo con daños. Revisá el módulo de Incidentes para resolverlo.
                    </p>
                </div>
            </div>";

        try
        {
            await _emailService.SendEmailAsync(destination, subject, body, cancellationToken);
            _logger.LogInformation("Incident alert sent to {Destination} for incident {IncidentId}", destination, incidentId);
        }
        catch (Exception ex)
        {
            // El envío no debe interrumpir el flujo principal
            _logger.LogError(ex, "Failed to send incident alert for {IncidentId}", incidentId);
        }
    }
}
