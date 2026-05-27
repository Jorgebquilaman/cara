using Application.DTOs;
using MediatR;

namespace Application.Features.Dashboard.Queries.GetDashboard;

public record GetDashboardQuery : IRequest<DashboardDto>;
