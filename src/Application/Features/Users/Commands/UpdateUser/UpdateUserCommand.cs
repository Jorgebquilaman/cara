using Application.Services;
using MediatR;

namespace Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string Dni,
    string? PhoneNumber,
    Guid? CareerId,
    string Role,
    bool IsActive,
    string? Password = null) : IRequest;
