using System.Security.Claims;
using Application.DTOs;
using Application.Features.Reservations.Commands.ApproveReservation;
using Application.Features.Reservations.Commands.CancelReservation;
using Application.Features.Reservations.Commands.CompleteReservation;
using Application.Features.Reservations.Commands.CreateReservation;
using Application.Features.Reservations.Queries.GetAllReservations;
using Application.Features.Reservations.Queries.GetUserReservations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> GetAll()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role is "Admin" or "Staff")
            return Ok(await _mediator.Send(new GetAllReservationsQuery()));

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _mediator.Send(new GetUserReservationsQuery(userId)));
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(CreateReservationCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _mediator.Send(new CompleteReservationCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _mediator.Send(new CancelReservationCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _mediator.Send(new ApproveReservationCommand(id));
        return NoContent();
    }
}
