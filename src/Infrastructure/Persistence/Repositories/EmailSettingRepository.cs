using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class EmailSettingRepository : IEmailSettingRepository
{
    private readonly ApplicationDbContext _context;

    public EmailSettingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmailSetting?> GetAsync(CancellationToken cancellationToken = default)
        => await _context.EmailSettings.FirstOrDefaultAsync(cancellationToken);

    public void Add(EmailSetting setting) => _context.EmailSettings.Add(setting);
    public void Update(EmailSetting setting) => _context.EmailSettings.Update(setting);
}
