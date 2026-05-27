using Application.DTOs;
using Application.Services;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetTokenRepository _resetTokenRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IAccountRequestRepository _accountRequestRepository;

    public AuthController(
        IAuthService authService,
        IUserRepository userRepository,
        IPasswordResetTokenRepository resetTokenRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        IAccountRequestRepository accountRequestRepository)
    {
        _authService = authService;
        _userRepository = userRepository;
        _resetTokenRepository = resetTokenRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _accountRequestRepository = accountRequestRepository;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto login)
    {
        var result = await _authService.LoginAsync(login);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(CreateUserDto registration)
    {
        var result = await _authService.RegisterAsync(registration);
        return CreatedAtAction(nameof(Login), new { email = result.User.InstitutionalEmail }, result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        await _authService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);
        return Ok(new { message = "Contraseña actualizada correctamente." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null)
            return Ok(new { message = "Si el email existe, recibirás un enlace de recuperación." });
            
        if (!user.IsActive)
            return BadRequest(new { message = "Tu cuenta aún no está activa. Por favor, esperá a que un administrativo autorice el uso del sistema." });

        var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        var resetToken = new Domain.Entities.PasswordResetToken(user.Id, token, DateTime.UtcNow.AddHours(1));
        _resetTokenRepository.Add(resetToken);
        await _unitOfWork.SaveChangesAsync();

        var frontendUrl = _configuration["FrontendUrl"] ?? $"{Request.Scheme}://{Request.Host}";
        var resetLink = $"{frontendUrl}/reset-password?token={token}";

        var body = $@"
            <h2>Recuperación de contraseña - CARA</h2>
            <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p><a href='{resetLink}'>{resetLink}</a></p>
            <p>Este enlace expira en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignorá este mensaje.</p>";

        try
        {
            await _emailService.SendEmailAsync(dto.Email, "Recuperación de contraseña - CARA", body);
        }
        catch
        {
            // If email fails, still return OK to not leak user existence
        }

        return Ok(new { message = "Si el email existe, recibirás un enlace de recuperación." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var resetToken = await _resetTokenRepository.GetByTokenAsync(dto.Token);
        if (resetToken == null || !resetToken.IsValid())
            return BadRequest(new { message = "Token inválido o expirado." });

        var user = resetToken.User;
        var newHash = _authService.HashPassword(dto.NewPassword);
        user.SetPassword(newHash);
        resetToken.MarkAsUsed();

        _userRepository.Update(user);
        _resetTokenRepository.Update(resetToken);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Contraseña restablecida correctamente." });
    }

    [HttpPost("request-account")]
    public async Task<IActionResult> RequestAccount([FromBody] RequestAccountDto dto)
    {
        if (await _userRepository.ExistsByEmailAsync(dto.Email))
        {
            return BadRequest(new { message = "Este correo ya está registrado. Por favor, contactá a un administrador si no podés ingresar." });
        }

        try
        {
            if (!Enum.TryParse<Domain.Enums.UserRole>(dto.Role, true, out var role))
                role = Domain.Enums.UserRole.Student;

            // 1. Create the request as PENDING
            var request = new Domain.Entities.AccountRequest(dto.FirstName, dto.LastName, dto.Email, dto.Dni, dto.Role, dto.Reason, dto.PhoneNumber, dto.CareerId, dto.AttachmentUrl);
            _accountRequestRepository.Add(request);

            // 2. Create the user as INACTIVE
            var tempPassword = Guid.NewGuid().ToString("N")[..12] + "!Aa1";
            var hash = _authService.HashPassword(tempPassword);
            
            var user = new Domain.Entities.User(
                dto.FirstName, 
                dto.LastName, 
                new Domain.ValueObjects.Email(dto.Email), 
                role, 
                hash, 
                dto.Dni, 
                dto.PhoneNumber, 
                dto.CareerId,
                false); // isActive = false

            _userRepository.Add(user);
            
            await _unitOfWork.SaveChangesAsync();

            // 3. Send email to the user (Pending Approval)
            var userBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;'>
                    <h2 style='color: #1e293b;'>Solicitud Recibida - CARA</h2>
                    <p>Hola {dto.FirstName},</p>
                    <p>Hemos recibido tu solicitud de alta en el sistema CARA. Tu cuenta ha sido creada pero se encuentra <strong>pendiente de aprobación</strong> por parte del equipo administrativo.</p>
                    <p>Una vez que tu solicitud sea revisada y aprobada, recibirás un nuevo correo con las instrucciones para establecer tu contraseña y comenzar a usar el sistema.</p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                    <p style='font-size: 0.875rem;'><strong>Detalles de tu solicitud:</strong></p>
                    <ul style='font-size: 0.875rem;'>
                        <li><strong>Usuario:</strong> {dto.Email}</li>
                        <li><strong>Rol solicitado:</strong> {dto.Role}</li>
                    </ul>
                </div>";

            try 
            { 
                await _emailService.SendEmailAsync(dto.Email, "Tu solicitud en CARA está siendo procesada", userBody); 
            }
            catch { }

            // 4. Notify admins about the new request
            var admins = await _userRepository.GetByRoleAsync("Admin");
            var adminEmails = admins.Select(a => a.InstitutionalEmail.Value).ToList();

            if (adminEmails.Count > 0)
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? $"{Request.Scheme}://{Request.Host}";
                var adminLink = $"{frontendUrl}/solicitudes-alta";

                var adminBody = $@"
                    <h2>Nueva solicitud de alta de usuario</h2>
                    <p><strong>Nombre:</strong> {dto.FirstName} {dto.LastName}</p>
                    <p><strong>Email:</strong> {dto.Email}</p>
                    <p><strong>Rol solicitado:</strong> {dto.Role}</p>
                    <p><strong>Motivo:</strong> {dto.Reason}</p>
                    <hr/>
                    <p>Podés revisar y aprobar esta solicitud desde el panel de administración:</p>
                    <a href='{adminLink}'>{adminLink}</a>";

                foreach (var email in adminEmails)
                {
                    try { await _emailService.SendEmailAsync(email, "Nueva solicitud en CARA", adminBody); }
                    catch { }
                }
            }

            return Ok(new { message = "Tu solicitud ha sido enviada y está pendiente de aprobación. Recibirás un correo cuando sea procesada." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("upload-attachment")]
    public async Task<IActionResult> UploadAttachment(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not ".jpg" and not ".jpeg" and not ".png" and not ".pdf")
            return BadRequest("Only JPG/PNG/PDF files are allowed.");

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads", "requests");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/uploads/requests/{fileName}";
        return Ok(new { url });
    }
}

public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class RequestAccountDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Guid? CareerId { get; set; }
    public string Role { get; set; } = "Student";
    public string Reason { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
}
