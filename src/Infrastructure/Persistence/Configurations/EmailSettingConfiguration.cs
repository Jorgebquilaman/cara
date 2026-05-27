using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class EmailSettingConfiguration : IEntityTypeConfiguration<EmailSetting>
{
    public void Configure(EntityTypeBuilder<EmailSetting> builder)
    {
        builder.ToTable("EmailSettings");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Host).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Port).IsRequired();
        builder.Property(e => e.Username).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Password).HasMaxLength(500).IsRequired();
        builder.Property(e => e.FromEmail).HasMaxLength(200).IsRequired();
        builder.Property(e => e.FromName).HasMaxLength(200);
        builder.Property(e => e.UseSsl).IsRequired();
    }
}
