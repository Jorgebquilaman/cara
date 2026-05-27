using System.Net;
using System.Net.Mail;
using Application.Services;
using Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IEmailSettingRepository _emailSettingRepository;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IEmailSettingRepository emailSettingRepository, ILogger<EmailService> logger)
    {
        _emailSettingRepository = emailSettingRepository;
        _logger = logger;
    }

    public async Task<bool> IsConfiguredAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _emailSettingRepository.GetAsync(cancellationToken);
        return settings != null
            && !string.IsNullOrWhiteSpace(settings.Host)
            && !string.IsNullOrWhiteSpace(settings.Username)
            && !string.IsNullOrWhiteSpace(settings.Password)
            && !string.IsNullOrWhiteSpace(settings.FromEmail);
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var settings = await _emailSettingRepository.GetAsync(cancellationToken);
        if (settings == null)
            throw new InvalidOperationException("Email settings not configured.");

        using var client = new SmtpClient(settings.Host, settings.Port)
        {
            Credentials = new NetworkCredential(settings.Username, settings.Password),
            EnableSsl = settings.UseSsl,
        };

        using var message = new MailMessage
        {
            From = new MailAddress(settings.FromEmail, settings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };
        message.To.Add(to);

        await client.SendMailAsync(message, cancellationToken);
        _logger.LogInformation("Email sent to {To} with subject {Subject}", to, subject);
    }
}
