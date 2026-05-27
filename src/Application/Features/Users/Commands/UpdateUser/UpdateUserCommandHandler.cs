using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
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

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
