using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(IUserRepository userRepository, IAuthService authService, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _authService = authService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User {request.Id} not found.");

        user.UpdateDetails(request.FirstName, request.LastName, request.Dni, request.PhoneNumber, request.CareerId);

        var newRole = Enum.Parse<UserRole>(request.Role);
        if (user.Role != newRole)
            user.ChangeRole(newRole);

        if (request.IsActive && !user.IsActive)
            user.Activate();
        else if (!request.IsActive && user.IsActive)
            user.Deactivate();

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 6)
                throw new InvalidOperationException("La contraseña debe tener al menos 6 caracteres.");
            user.SetPassword(_authService.HashPassword(request.Password));
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
