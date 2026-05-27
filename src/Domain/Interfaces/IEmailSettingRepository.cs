using Domain.Entities;

namespace Domain.Interfaces;

public interface IEmailSettingRepository
{
    Task<EmailSetting?> GetAsync(CancellationToken cancellationToken = default);
    void Add(EmailSetting setting);
    void Update(EmailSetting setting);
}
