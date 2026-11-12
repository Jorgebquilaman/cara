namespace Domain.Entities;

public class Incident
{
    public Guid Id { get; private set; }
    public Guid? LoanId { get; private set; }
    public Guid? AssetId { get; private set; }
    public string Description { get; private set; }
    public string? PhotoUrl { get; private set; }
    public DateTime ReportedAt { get; private set; }
    public Guid ReportedBy { get; private set; }
    public bool IsResolved { get; private set; }
    public DateTime? ResolvedAt { get; private set; }

    public Loan? Loan { get; private set; }
    public Asset? Asset { get; private set; }

    private Incident() { }

    /// <summary>Incidente vinculado a un préstamo (p.ej. daño detectado en la devolución).</summary>
    public Incident(Guid loanId, string description, Guid reportedBy, string? photoUrl = null)
    {
        Id = Guid.NewGuid();
        LoanId = loanId;
        Description = description;
        PhotoUrl = photoUrl;
        ReportedAt = DateTime.UtcNow;
        ReportedBy = reportedBy;
        IsResolved = false;
    }

    /// <summary>
    /// Incidente reportado directamente contra un activo (sin préstamo asociado),
    /// por ejemplo: rotura por el paso del tiempo mientras el activo está guardado.
    /// </summary>
    public static Incident ForAsset(Guid assetId, string description, Guid reportedBy, string? photoUrl = null)
    {
        var incident = new Incident(assetId, description, reportedBy, photoUrl);
        incident.AssetId = assetId;
        return incident;
    }

    /// <summary>Incidente con préstamo asociado y su activo derivado.</summary>
    public static Incident Create(Guid loanId, Guid? assetId, string description, Guid reportedBy, string? photoUrl = null)
    {
        var incident = new Incident(loanId, description, reportedBy, photoUrl);
        incident.AssetId = assetId;
        return incident;
    }

    public void Resolve()
    {
        IsResolved = true;
        ResolvedAt = DateTime.UtcNow;
    }
}
