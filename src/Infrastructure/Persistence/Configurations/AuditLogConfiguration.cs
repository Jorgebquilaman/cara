using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(al => al.Id);

        builder.Property(al => al.EntityName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.EntityId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(al => al.Action)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(al => al.PerformedBy)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(al => al.PreviousValues)
            .HasColumnType("jsonb");

        builder.Property(al => al.NewValues)
            .HasColumnType("jsonb");

        builder.Property(al => al.Timestamp)
            .IsRequired();

        builder.HasIndex(al => al.EntityName);
        builder.HasIndex(al => al.EntityId);
        builder.HasIndex(al => al.Timestamp);
    }
}
