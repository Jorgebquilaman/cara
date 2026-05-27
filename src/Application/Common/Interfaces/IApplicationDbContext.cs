using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Asset> Assets { get; }
    DbSet<User> Users { get; }
    DbSet<Loan> Loans { get; }
    DbSet<Reservation> Reservations { get; }
    DbSet<Incident> Incidents { get; }
    DbSet<Sanction> Sanctions { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
