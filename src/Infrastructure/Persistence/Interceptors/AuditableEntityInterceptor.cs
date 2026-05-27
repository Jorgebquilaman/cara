using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Infrastructure.Persistence.Interceptors;

public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateTimestamps(eventData);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateTimestamps(eventData);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void UpdateTimestamps(DbContextEventData eventData)
    {
        var context = eventData.Context;
        if (context == null) return;

        var now = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                SetPropertyIfExists(entry, "CreatedAt", now);
            }

            if (entry.State == EntityState.Modified)
            {
                SetPropertyIfExists(entry, "UpdatedAt", now);
            }
        }
    }

    private static void SetPropertyIfExists(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry, string propertyName, object value)
    {
        var prop = entry.Properties.FirstOrDefault(p => p.Metadata.Name == propertyName);
        if (prop != null && prop.CurrentValue == null)
        {
            prop.CurrentValue = value;
        }
    }
}
