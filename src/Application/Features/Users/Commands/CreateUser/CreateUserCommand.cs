using Application.DTOs;
using MediatR;

namespace Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand : IRequest<UserDto>
{
    public string FirstName { get; init; }
    public string LastName { get; init; }
    public string Email { get; init; }
    public string Dni { get; init; }
    public string? PhoneNumber { get; init; }
    public Guid? CareerId { get; init; }
    public string Role { get; init; }
    public string Password { get; init; }
}
