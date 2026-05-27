using Application.DTOs;
using MediatR;

namespace Application.Features.Dashboard.Queries.GetUserDashboard;

public record GetUserDashboardQuery(Guid UserId) : IRequest<UserDashboardDto>;
