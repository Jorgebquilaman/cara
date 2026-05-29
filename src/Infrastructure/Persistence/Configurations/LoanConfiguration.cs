using Domain.Entities;
using Domain.Enums;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Infrastructure.Persistence.Configurations;

public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.ToTable("Loans");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Status)
            .IsRequired()
            .HasConversion(new EnumToStringConverter<LoanStatus>())
            .HasMaxLength(20);

        builder.OwnsOne(l => l.Period, period =>
        {
            period.Property(p => p.Start)
                .HasColumnName("StartDate")
                .IsRequired();

            period.Property(p => p.End)
                .HasColumnName("DueDate")
                .IsRequired();
        });

        builder.Property(l => l.RejectionReason)
            .HasMaxLength(500);

        builder.Property(l => l.Observations)
            .HasMaxLength(1000);

        builder.Property(l => l.Prenda)
            .HasDefaultValue(0)
            .HasColumnType("decimal(18,2)");

        builder.Property(l => l.PrendaReturned)
            .HasDefaultValue(false);

        builder.Property(l => l.PrendaReturnedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(l => l.RequestedAt)
            .IsRequired();

        builder.Property(l => l.ApprovedAt);
        builder.Property(l => l.ReturnedAt);
        builder.Property(l => l.ApprovedBy);
        builder.Property(l => l.UserRating);
        builder.Property(l => l.UserRatingComment)
            .HasMaxLength(500);

        builder.HasOne(l => l.Asset)
            .WithMany(a => a.Loans)
            .HasForeignKey(l => l.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.User)
            .WithMany(u => u.Loans)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(l => l.Incidents)
            .WithOne(i => i.Loan)
            .HasForeignKey(i => i.LoanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.Status);
        builder.HasIndex(l => l.UserId);
        builder.HasIndex(l => l.AssetId);
    }
}
