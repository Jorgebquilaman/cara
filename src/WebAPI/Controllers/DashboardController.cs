using Application.DTOs;
using Application.Features.Dashboard.Queries.GetDashboard;
using Application.Features.Dashboard.Queries.GetUserDashboard;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        return Ok(await _mediator.Send(new GetDashboardQuery()));
    }

    [HttpGet("user")]
    public async Task<ActionResult<UserDashboardDto>> GetUser()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _mediator.Send(new GetUserDashboardQuery(userId)));
    }
}
