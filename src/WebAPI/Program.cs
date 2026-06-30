using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Application.Common.Behaviors;
using Application.Common.Interfaces;
using Application.Services;
using Domain.Interfaces;
using FluentValidation;
using Infrastructure.Persistence.DbContext;
using Infrastructure.Persistence.Interceptors;
using Infrastructure.Persistence.Repositories;
using Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebAPI.Hubs;
using WebAPI.Middlewares;
using WebAPI.Services;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

builder.Services.AddScoped<AuditableEntityInterceptor>();

// ── Repositories ──────────────────────────────────────────
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<ILoanRepository, LoanRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IIncidentRepository, IncidentRepository>();
builder.Services.AddScoped<ISanctionRepository, SanctionRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IEmailSettingRepository, EmailSettingRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
builder.Services.AddScoped<IAccountRequestRepository, AccountRequestRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<ICareerRepository, CareerRepository>();
builder.Services.AddScoped<IContractRepository, ContractRepository>();
builder.Services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());
builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// ── Application Services ──────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IWebNotificationService, WebNotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpContextAccessor();

// ── MediatR & FluentValidation ───────────────────────────
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Application.Features.Assets.Commands.CreateAsset.CreateAssetCommand).Assembly));

builder.Services.AddValidatorsFromAssembly(typeof(Application.Features.Assets.Commands.CreateAsset.CreateAssetValidator).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// ── AutoMapper ────────────────────────────────────────────
builder.Services.AddAutoMapper(typeof(Application.Common.Mappings.MappingProfile).Assembly);

// ── JWT Authentication ────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                    Console.WriteLine($"SignalR Token received for {path}: {accessToken.ToString().Substring(0, 10)}...");
                }

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ── SignalR ───────────────────────────────────────────────
builder.Services.AddSignalR();

// ── Redis Cache ──────────────────────────────────────────
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "CARA:";
});

// ── Controllers ──────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── CORS ──────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ── Static Files (uploads) ───────────────────────────────
var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads");
if (!Directory.Exists(uploadsDir))
    Directory.CreateDirectory(uploadsDir);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsDir),
    RequestPath = "/uploads"
});

// ── Middleware Pipeline ───────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

var endpointDataSource = app.Services.GetRequiredService<Microsoft.AspNetCore.Routing.EndpointDataSource>();
foreach (var endpoint in endpointDataSource.Endpoints)
{
    if (endpoint is Microsoft.AspNetCore.Routing.RouteEndpoint routeEndpoint)
    {
        Console.WriteLine($"Route: {routeEndpoint.RoutePattern.RawText}");
    }
}

app.MapControllers();
// DEBUG
var controllerTypes = builder.Services
    .Where(s => s.ServiceType == typeof(Microsoft.AspNetCore.Mvc.Controllers.IControllerFactoryProvider))
    .ToList();
Console.WriteLine($"Controllers registered: {controllerTypes.Count}");
app.MapHub<LoanHub>("/hubs/loans");
app.MapHub<NotificationHub>("/hubs/notifications");

// ── Auto-create database and seed (dev only) ──────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // In development, we want to ensure the schema is up to date.
    // EnsureCreated won't apply changes if the DB already exists.
    await db.Database.EnsureCreatedAsync();

    // Force creation of missing tables if they weren't in the initial EnsureCreated
    await db.Database.ExecuteSqlRawAsync(
        @"CREATE TABLE IF NOT EXISTS ""Departments"" (
            ""Id"" UUID PRIMARY KEY,
            ""Name"" VARCHAR(200) NOT NULL
        )");
    await db.Database.ExecuteSqlRawAsync(
        @"CREATE TABLE IF NOT EXISTS ""Careers"" (
            ""Id"" UUID PRIMARY KEY,
            ""Name"" VARCHAR(200) NOT NULL,
            ""DepartmentId"" UUID NOT NULL REFERENCES ""Departments""(""Id"")
        )");
    await db.Database.ExecuteSqlRawAsync(
        @"CREATE TABLE IF NOT EXISTS ""SatisfactionSurveys"" (
            ""Id"" UUID PRIMARY KEY,
            ""LoanId"" UUID NOT NULL REFERENCES ""Loans""(""Id""),
            ""OverallRating"" INTEGER NOT NULL,
            ""ServiceRating"" INTEGER NOT NULL,
            ""RequestTimeRating"" INTEGER NOT NULL,
            ""AssetQualityRating"" INTEGER NOT NULL,
            ""Comments"" TEXT NULL,
            ""CreatedAt"" TIMESTAMPTZ NOT NULL
        )");


    await db.Database.ExecuteSqlRawAsync(@"
        CREATE TABLE IF NOT EXISTS ""AccountRequests"" (
            ""Id"" UUID PRIMARY KEY,
            ""FirstName"" VARCHAR(200) NOT NULL,
            ""LastName"" VARCHAR(200) NOT NULL,
            ""Email"" VARCHAR(200) NOT NULL,
            ""Dni"" VARCHAR(20) NOT NULL DEFAULT '',
            ""AttachmentUrl"" TEXT NULL,
            ""RequestedRole"" VARCHAR(50) NOT NULL,
            ""Reason"" TEXT NOT NULL,
            ""RequestedAt"" TIMESTAMPTZ NOT NULL,
            ""IsApproved"" BOOLEAN NOT NULL,
            ""ApprovedAt"" TIMESTAMPTZ NULL,
            ""ApprovedByUserId"" VARCHAR(100) NULL,
            ""Notified"" BOOLEAN NOT NULL,
            ""IsRejected"" BOOLEAN NOT NULL DEFAULT FALSE,
            ""RejectionReason"" TEXT NULL
        )");

    // Ensure columns exist (even if table was created by EnsureCreated without them)
    string[] userAlters = {
        @"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Dni"" VARCHAR(20) NOT NULL DEFAULT ''",
        @"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PhoneNumber"" VARCHAR(50) NULL",
        @"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""CareerId"" UUID NULL",
        @"ALTER TABLE ""AccountRequests"" ADD COLUMN IF NOT EXISTS ""PhoneNumber"" VARCHAR(50) NULL",
        @"ALTER TABLE ""AccountRequests"" ADD COLUMN IF NOT EXISTS ""CareerId"" UUID NULL",
        @"ALTER TABLE ""Loans"" ADD COLUMN IF NOT EXISTS ""PrendaReturnedAt"" timestamp with time zone NULL",
        @"ALTER TABLE ""Loans"" ADD COLUMN IF NOT EXISTS ""UserRating"" INTEGER NULL",
        @"ALTER TABLE ""Loans"" ADD COLUMN IF NOT EXISTS ""UserRatingComment"" VARCHAR(500) NULL",
        @"DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Contracts' AND column_name = 'Description') THEN
                ALTER TABLE ""Contracts"" RENAME COLUMN ""Description"" TO ""Content"";
            END IF;
        END $$;",
        @"CREATE TABLE IF NOT EXISTS ""Contracts"" (
            ""Id"" UUID PRIMARY KEY,
            ""Code"" VARCHAR(50) NOT NULL,
            ""Title"" VARCHAR(200) NOT NULL,
            ""Content"" TEXT NULL,
            ""Provider"" VARCHAR(200) NULL,
            ""StartDate"" TIMESTAMP NOT NULL,
            ""EndDate"" TIMESTAMP NULL,
            ""FileUrl"" VARCHAR(500) NULL,
            ""Status"" VARCHAR(20) NOT NULL DEFAULT 'Active',
            ""IsDeleted"" BOOLEAN NOT NULL DEFAULT FALSE,
            ""CreatedAt"" TIMESTAMP NOT NULL,
            ""UpdatedAt"" TIMESTAMP NULL
        )",
        @"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Contracts_Code"" ON ""Contracts"" (""Code"")"

    };

    foreach (var sql in userAlters)
    {
        try { await db.Database.ExecuteSqlRawAsync(sql); } catch { }
    }

    // 3. Seed Users
    if (!await db.Users.AnyAsync())
    {
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var adminEmail = new Domain.ValueObjects.Email("admin@iupa.edu.ar");
        var admin = new Domain.Entities.User("Admin", "CARA", adminEmail, Domain.Enums.UserRole.Admin, authService.HashPassword("Admin123!"));
        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }

    // 4. Seed departments and careers
    if (!await db.Departments.AnyAsync())
    {
        var artes = new Domain.Entities.Department("Departamento de Artes Visuales");
        var musica = new Domain.Entities.Department("Departamento de Música");
        var teatro = new Domain.Entities.Department("Departamento de Teatro");
        var danza = new Domain.Entities.Department("Departamento de Danza");
        var audiovisual = new Domain.Entities.Department("Departamento de Artes Audiovisuales");
        var literaria = new Domain.Entities.Department("Departamento de Artes Literarias");

        db.Departments.AddRange(artes, musica, teatro, danza, audiovisual, literaria);

        db.Careers.AddRange(
            new Domain.Entities.Career("Profesorado de Artes Visuales", artes.Id),
            new Domain.Entities.Career("Licenciatura en Artes Visuales", artes.Id),
            new Domain.Entities.Career("Tecnicatura en Pintura", artes.Id),
            new Domain.Entities.Career("Profesorado de Música", musica.Id),
            new Domain.Entities.Career("Licenciatura en Música", musica.Id),
            new Domain.Entities.Career("Tecnicatura en Instrumento", musica.Id),
            new Domain.Entities.Career("Profesorado de Teatro", teatro.Id),
            new Domain.Entities.Career("Licenciatura en Teatro", teatro.Id),
            new Domain.Entities.Career("Profesorado de Danza", danza.Id),
            new Domain.Entities.Career("Tecnicatura en Danza Contemporánea", danza.Id),
            new Domain.Entities.Career("Licenciatura en Artes Audiovisuales", audiovisual.Id),
            new Domain.Entities.Career("Tecnicatura en Realización Audiovisual", audiovisual.Id),
            new Domain.Entities.Career("Profesorado de Letras", literaria.Id),
            new Domain.Entities.Career("Licenciatura en Letras", literaria.Id)
        );

        await db.SaveChangesAsync();
    }
}

await app.RunAsync();
