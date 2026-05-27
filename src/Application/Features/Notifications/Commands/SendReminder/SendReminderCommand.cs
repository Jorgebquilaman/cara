using MediatR;

namespace Application.Features.Notifications.Commands.SendReminder;

public record SendReminderCommand(Guid LoanId) : IRequest;
