using Application.Services;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/email-config")]
[Authorize(Roles = "Admin")]
public class EmailConfigurationController : ControllerBase
{
    private readonly IEmailSettingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public EmailConfigurationController(IEmailSettingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await _repository.GetAsync();
        if (settings == null)
            return Ok(new
            {
                host = "smtp.gmail.com",
                port = 587,
                username = "",
                password = "",
                fromEmail = "",
                fromName = "CARA - IUPA",
                useSsl = true,
            });

        return Ok(new
        {
            host = settings.Host,
            port = settings.Port,
            username = settings.Username,
            password = "",
            fromEmail = settings.FromEmail,
            fromName = settings.FromName,
            useSsl = settings.UseSsl,
        });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateEmailConfigDto dto)
    {
        var settings = await _repository.GetAsync();
        if (settings == null)
        {
            settings = new Domain.Entities.EmailSetting(
                dto.Host, dto.Port, dto.Username,
                dto.Password, dto.FromEmail, dto.FromName, dto.UseSsl);
            _repository.Add(settings);
        }
        else
        {
            settings.Host = dto.Host;
            settings.Port = dto.Port;
            settings.Username = dto.Username;
            if (!string.IsNullOrWhiteSpace(dto.Password))
                settings.Password = dto.Password;
            settings.FromEmail = dto.FromEmail;
            settings.FromName = dto.FromName;
            settings.UseSsl = dto.UseSsl;
        }

        await _unitOfWork.SaveChangesAsync();
        return Ok(new { message = "Configuración de email actualizada." });
    }
}

public class UpdateEmailConfigDto
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "CARA - IUPA";
    public bool UseSsl { get; set; } = true;
}
