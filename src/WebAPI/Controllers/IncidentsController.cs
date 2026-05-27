using Application.DTOs;
using Application.Features.Incidents.Commands.CreateIncident;
using Application.Features.Incidents.Commands.ResolveIncident;
using Application.Features.Incidents.Queries.GetIncidents;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public IncidentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<IncidentDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetIncidentsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<IncidentDto>> Create(CreateIncidentCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(Create), null, result);
    }

    [HttpPost("{id:guid}/resolve")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Resolve(Guid id)
    {
        await _mediator.Send(new ResolveIncidentCommand(id));
        return NoContent();
    }
}
