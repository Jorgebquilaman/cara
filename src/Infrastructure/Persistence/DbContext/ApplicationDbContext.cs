using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.DbContext;

public class ApplicationDbContext : Microsoft.EntityFrameworkCore.DbContext, IUnitOfWork, IApplicationDbContext
{
    private readonly AuditableEntityInterceptor _auditInterceptor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditableEntityInterceptor auditInterceptor)
        : base(options)
    {
        _auditInterceptor = auditInterceptor;
    }

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<Sanction> Sanctions => Set<Sanction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<EmailSetting> EmailSettings => Set<EmailSetting>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<AccountRequest> AccountRequests => Set<AccountRequest>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Career> Careers => Set<Career>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditInterceptor);
        base.OnConfiguring(optionsBuilder);
    }
}
