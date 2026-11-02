using Application.Common.Interfaces;
using Domain.Interfaces;
using Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid UserId) : IRequest;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteUserCommandHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User {request.UserId} not found.");

        var hasLoans = await _context.Loans.AnyAsync(l => l.UserId == request.UserId, cancellationToken);
        var hasReservations = await _context.Reservations.AnyAsync(r => r.UserId == request.UserId, cancellationToken);
        var hasSanctions = await _context.Sanctions.AnyAsync(s => s.UserId == request.UserId, cancellationToken);

        if (hasLoans || hasReservations || hasSanctions)
            throw new InvalidOperationException(
                "El usuario tiene registros asociados (préstamos, reservas o sanciones). Desactivá la cuenta en lugar de eliminarla para conservar el historial.");

        // Limpiar dependencias antes de eliminar
        var tokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == request.UserId)
            .ToListAsync(cancellationToken);
        _context.PasswordResetTokens.RemoveRange(tokens);

        var notifications = await _context.Notifications
            .Where(n => n.UserId == request.UserId)
            .ToListAsync(cancellationToken);
        _context.Notifications.RemoveRange(notifications);

        _context.Users.Remove(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
