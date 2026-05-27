namespace Application.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    Task<bool> IsConfiguredAsync(CancellationToken cancellationToken = default);
}
