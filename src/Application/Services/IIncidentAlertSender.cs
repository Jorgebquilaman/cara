namespace Application.Services;

/// <summary>
/// Envía un email con todos los datos del incidente al casillero configurado
/// en Configuración de Email (IncidentsEmail): activos rotos, robados o dañados.
/// Se invoca cuando se reporta un incidente o cuando se devuelve un activo con novedades.
/// </summary>
public interface IIncidentAlertSender
{
    Task SendAsync(Guid incidentId, CancellationToken cancellationToken = default);
}
