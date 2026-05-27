using Application.Services;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/account-requests")]
[Authorize(Roles = "Admin")]
public class AccountRequestsController : ControllerBase
{
    private readonly IAccountRequestRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly IPasswordResetTokenRepository _resetTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AccountRequestsController(
        IAccountRequestRepository repository,
        IUserRepository userRepository,
        IAuthService authService,
        IEmailService emailService,
        IPasswordResetTokenRepository resetTokenRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _repository = repository;
        _userRepository = userRepository;
        _authService = authService;
        _emailService = emailService;
        _resetTokenRepository = resetTokenRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _repository.GetAllAsync();
        return Ok(requests.Select(r => new
        {
            r.Id,
            r.FirstName,
            r.LastName,
            r.Email,
            r.Dni,
            phoneNumber = r.PhoneNumber,
            careerId = r.CareerId,
            attachmentUrl = r.AttachmentUrl,
            requestedRole = r.RequestedRole,
            r.Reason,
            requestedAt = r.RequestedAt,
            r.IsApproved,
            approvedAt = r.ApprovedAt,
            r.Notified,
            r.IsRejected,
            rejectionReason = r.RejectionReason,
        }));
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var request = await _repository.GetByIdAsync(id);
        if (request == null)
            return NotFound();

        if (request.IsApproved)
            return BadRequest(new { message = "Esta solicitud ya fue aprobada." });

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!;

        // 1. Find the user (should have been created as inactive during RequestAccount)
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // Fallback: create user if for some reason it didn't exist
            var tempPassword = Guid.NewGuid().ToString("N")[..12] + "!Aa1";
            var hash = _authService.HashPassword(tempPassword);
            var email = new Domain.ValueObjects.Email(request.Email);
            var role = Enum.Parse<Domain.Enums.UserRole>(request.RequestedRole);
            user = new Domain.Entities.User(request.FirstName, request.LastName, email, role, hash, request.Dni, request.PhoneNumber, request.CareerId, false);
            _userRepository.Add(user);
        }

        // 2. Activate user
        user.Activate();
        _userRepository.Update(user);

        // 3. Approve request
        request.Approve(userIdClaim);
        _repository.Update(request);

        // 4. Create password reset token
        var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        var resetToken = new Domain.Entities.PasswordResetToken(user.Id, token, DateTime.UtcNow.AddDays(7));
        _resetTokenRepository.Add(resetToken);

        await _unitOfWork.SaveChangesAsync();

        // 5. Send email to the user
        var frontendUrl = _configuration["FrontendUrl"] ?? $"{Request.Scheme}://{Request.Host}";
        var resetLink = $"{frontendUrl}/reset-password?token={token}";

        var body = $@"
            <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;'>
                <h2 style='color: #1e293b;'>¡Tu solicitud fue aprobada!</h2>
                <p>Hola {request.FirstName},</p>
                <p>Tu solicitud de alta en CARA ha sido aprobada. Tu cuenta ya se encuentra activa.</p>
                <p>Para comenzar a usar el sistema, necesitás establecer tu contraseña haciendo clic en el siguiente botón:</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{resetLink}' style='background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;'>Establecer mi contraseña</a>
                </div>
                <p style='font-size: 0.875rem; color: #64748b;'>Este enlace es válido por 7 días.</p>
                <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                <p style='font-size: 0.875rem;'><strong>Detalles de tu cuenta:</strong></p>
                <ul style='font-size: 0.875rem;'>
                    <li><strong>Usuario:</strong> {request.Email}</li>
                </ul>
            </div>";

        try
        {
            await _emailService.SendEmailAsync(request.Email, "Tu cuenta en CARA está lista", body);
            request.MarkNotified();
            _repository.Update(request);
            await _unitOfWork.SaveChangesAsync();
        }
        catch
        {
            return Ok(new { message = "Usuario activado, pero hubo un error al enviar el email. El usuario puede usar 'Olvidé mi contraseña'." });
        }

        return Ok(new { message = "Usuario activado y notificado exitosamente." });
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRequestDto dto)
    {
        var request = await _repository.GetByIdAsync(id);
        if (request == null)
            return NotFound();

        request.Reject(dto.Reason);
        _repository.Update(request);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Solicitud rechazada." });
    }

    [HttpPost("{id:guid}/notify")]
    public async Task<IActionResult> Notify(Guid id)
    {
        var request = await _repository.GetByIdAsync(id);
        if (request == null)
            return NotFound();
        if (!request.IsApproved)
            return BadRequest(new { message = "La solicitud debe estar aprobada primero." });

        var frontendUrl = HttpContext.RequestServices.GetRequiredService<IConfiguration>()["FrontendUrl"] ?? "http://localhost:5173";

        var body = $@"
            <h2>Tu cuenta en CARA está lista</h2>
            <p>Hola {request.FirstName},</p>
            <p>Tu solicitud de alta fue aprobada. Ingresá con tu email institucional y la siguiente contraseña temporal:</p>
            <p><a href='{frontendUrl}/login'>{frontendUrl}/login</a></p>
            <p>Ingresá y cambiá tu contraseña.</p>";

        try
        {
            await _emailService.SendEmailAsync(request.Email, "Tu cuenta en CARA está lista", body);
        }
        catch
        {
            return BadRequest(new { message = "Error al enviar el email. Revisá la configuración de correo." });
        }

        request.MarkNotified();
        _repository.Update(request);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Notificación enviada al usuario." });
    }
}

public class RejectRequestDto
{
    public string Reason { get; set; } = string.Empty;
}
