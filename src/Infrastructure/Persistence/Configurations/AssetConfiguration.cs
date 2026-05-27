using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Infrastructure.Persistence.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("Assets");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(a => a.Code)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion(new EnumToStringConverter<AssetStatus>())
            .HasMaxLength(20);

        builder.Property(a => a.Department)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Location)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Description)
            .HasMaxLength(500);

        builder.Property(a => a.ImageUrl)
            .HasMaxLength(500);

        builder.Property(a => a.MaxLoanDays)
            .IsRequired()
            .HasDefaultValue(7);

        builder.Property(a => a.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.CreatedAt)
            .IsRequired();

        builder.Property(a => a.UpdatedAt);

        builder.HasMany(a => a.Loans)
            .WithOne(l => l.Asset)
            .HasForeignKey(l => l.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Reservations)
            .WithOne(r => r.Asset)
            .HasForeignKey(r => r.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}
