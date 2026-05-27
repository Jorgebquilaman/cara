using Application.DTOs;
using Application.DTOs.Common;
using Application.Features.Assets.Commands.CreateAsset;
using Application.Features.Assets.Commands.DeleteAsset;
using Application.Features.Assets.Commands.UpdateAsset;
using Application.Features.Assets.Queries.GetAllAssets;
using Application.Features.Assets.Queries.GetAssetAvailability;
using Application.Features.Assets.Queries.GetAssetById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AssetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedList<AssetDto>>> GetAll([FromQuery] GetAllAssetsQuery query)
    {
        return Ok(await _mediator.Send(query));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AssetDto>> GetById(Guid id)
    {
        return Ok(await _mediator.Send(new GetAssetByIdQuery(id)));
    }

    [HttpGet("{id:guid}/availability")]
    public async Task<ActionResult<AssetAvailabilityDto>> GetAvailability(Guid id, [FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        return Ok(await _mediator.Send(new GetAssetAvailabilityQuery
        {
            AssetId = id,
            Start = start,
            End = end,
        }));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<AssetDto>> Create(CreateAssetCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<AssetDto>> Update(Guid id, UpdateAssetCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch.");

        return Ok(await _mediator.Send(command));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteAssetCommand(id));
        return NoContent();
    }

    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not ".jpg" and not ".jpeg" and not ".png")
            return BadRequest("Only JPG/PNG files are allowed.");

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads", "assets");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/uploads/assets/{fileName}";
        return Ok(new { url });
    }
}
