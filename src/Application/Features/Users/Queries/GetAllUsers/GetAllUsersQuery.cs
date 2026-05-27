using Application.DTOs;
using MediatR;

namespace Application.Features.Users.Queries.GetAllUsers;

public record GetAllUsersQuery : IRequest<IReadOnlyList<UserDto>>;
