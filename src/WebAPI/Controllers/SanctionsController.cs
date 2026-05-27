using Application.Features.Sanctions.Commands.CreateSanction;
using Application.Features.Sanctions.Commands.ResolveSanction;
using Application.Features.Sanctions.Queries.GetAllSanctions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SanctionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SanctionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll()
    {
        var sanctions = await _mediator.Send(new GetAllSanctionsQuery());
        return Ok(sanctions);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateSanctionCommand command)
    {
        var sanction = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), null, sanction);
    }

    [HttpPut("{id}/resolve")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Resolve(Guid id)
    {
        await _mediator.Send(new ResolveSanctionCommand { Id = id });
        return NoContent();
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads", "sanctions");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/uploads/sanctions/{fileName}";
        return Ok(new { url });
    }
}
