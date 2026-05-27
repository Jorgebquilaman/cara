using Application.Common.Interfaces;
using Application.Services;
using Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Notifications.Commands.SendReminder;

public class SendReminderCommandHandler : IRequestHandler<SendReminderCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public SendReminderCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task Handle(SendReminderCommand request, CancellationToken cancellationToken)
    {
        var loan = await _context.Loans
            .Include(l => l.Asset)
            .FirstOrDefaultAsync(l => l.Id == request.LoanId, cancellationToken);

        if (loan == null)
            throw new InvalidOperationException("Préstamo no encontrado");

        await _notificationService.NotifyLoanDueReminderAsync(loan, cancellationToken);
    }
}
