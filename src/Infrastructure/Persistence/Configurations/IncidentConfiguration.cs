using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class IncidentConfiguration : IEntityTypeConfiguration<Incident>
{
    public void Configure(EntityTypeBuilder<Incident> builder)
    {
        builder.ToTable("Incidents");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(i => i.PhotoUrl)
            .HasMaxLength(500);

        builder.Property(i => i.ReportedAt)
            .IsRequired();

        builder.Property(i => i.IsResolved)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(i => i.ResolvedAt);

        builder.HasOne(i => i.Loan)
            .WithMany(l => l.Incidents)
            .HasForeignKey(i => i.LoanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
