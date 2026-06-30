using Application.Features.Contracts.Commands.CreateContract;
using Application.Features.Contracts.Commands.DeleteContract;
using Application.Features.Contracts.Commands.UpdateContract;
using Application.Features.Contracts.Queries.GetAllContracts;
using Application.Features.Contracts.Queries.GetContractById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ContractsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContractsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var contracts = await _mediator.Send(new GetAllContractsQuery());
        return Ok(contracts);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var contract = await _mediator.Send(new GetContractByIdQuery(id));
        return Ok(contract);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateContractCommand command)
    {
        var contract = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = contract.Id }, contract);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContractCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var contract = await _mediator.Send(command);
        return Ok(contract);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteContractCommand(id));
        return NoContent();
    }
}
