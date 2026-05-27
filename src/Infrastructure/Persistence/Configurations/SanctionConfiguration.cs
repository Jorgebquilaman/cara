using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class SanctionConfiguration : IEntityTypeConfiguration<Sanction>
{
    public void Configure(EntityTypeBuilder<Sanction> builder)
    {
        builder.ToTable("Sanctions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.AttachmentUrl)
            .HasMaxLength(500);

        builder.Property(s => s.IssuedAt)
            .IsRequired();

        builder.Property(s => s.ExpiresAt)
            .IsRequired();

        builder.Property(s => s.ResolvedAt);

        builder.Property(s => s.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(s => s.User)
            .WithMany(u => u.Sanctions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.IsActive);
        builder.HasIndex(s => s.UserId);
    }
}
