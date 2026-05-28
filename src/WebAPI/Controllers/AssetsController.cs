using System.Text;
using Application.DTOs;
using Application.DTOs.Common;
using Application.Features.Assets.Commands.CreateAsset;
using Application.Features.Assets.Commands.DeleteAsset;
using Application.Features.Assets.Commands.UpdateAsset;
using Application.Features.Assets.Queries.GetAllAssets;
using Application.Features.Assets.Queries.GetAssetAvailability;
using Application.Features.Assets.Queries.GetAssetById;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

public class ZplRequest
{
    public List<Guid> AssetIds { get; set; } = new();
    public string? FrontendUrl { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAssetRepository _assetRepository;

    public AssetsController(IMediator mediator, IAssetRepository assetRepository)
    {
        _mediator = mediator;
        _assetRepository = assetRepository;
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

    [HttpPost("zpl")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GenerateZpl([FromBody] ZplRequest request)
    {
        if (request.AssetIds.Count == 0)
            return BadRequest(new { error = "Debe seleccionar al menos un activo." });

        var allAssets = await _assetRepository.GetAllAsync();
        var selected = allAssets.Where(a => request.AssetIds.Contains(a.Id)).ToList();

        if (selected.Count == 0)
            return BadRequest(new { error = "No se encontraron los activos seleccionados." });

        var frontendUrl = request.FrontendUrl ?? $"{Request.Scheme}://{Request.Host}";
        var zpl = GenerateZplBatch(selected, frontendUrl);
        var fileName = selected.Count == 1
            ? $"etiqueta_{selected[0].Code}.zpl"
            : "etiquetas.zpl";

        return File(Encoding.UTF8.GetBytes(zpl), "text/plain", fileName);
    }

    private static string GenerateZplBatch(List<Asset> assets, string baseUrl)
    {
        return string.Join("\n", assets.Select(a => GenerateZplLabel(a, baseUrl)));
    }

    private static string GenerateZplLabel(Asset asset, string baseUrl)
    {
        var status = asset.Status switch
        {
            AssetStatus.Available => "Disponible",
            AssetStatus.InUse => "En Uso",
            AssetStatus.Maintenance => "Mantenimiento",
            AssetStatus.Decommissioned => "De Baja",
            _ => asset.Status.ToString()
        };

        var url = $"{baseUrl.TrimEnd('/')}/assets/{asset.Id}";

        return $@"^XA
^PW1624
^LL1015

^FO40,40^GB1544,935,4^FS

^CF0,28
^FO70,65^FDINSTITUTO UNIVERSITARIO PATAGONICO^FS
^FO70,100^FDDE LAS ARTES (IUPA)^FS

^FO70,145^GB700,2,2^FS

^CF0,50
^FO70,175^FD{asset.Name.ToUpper()}^FS

^CF0,20
^FO70,250^FDCodigo: {asset.Code}^FS
^FO70,285^FDCategoria: {asset.Category}^FS
^FO70,320^FBDepartamento: {asset.Department}^FS
^FO70,355^FBUbicacion: {asset.Location}^FS
^FO70,390^FBEstado: {status}^FS

^FO900,175^BCN,80,Y,N,N^FD{asset.Code}^FS

^FO900,430^BQN,2,6^FDMA,{url}^FS

^FO930,750^CF0,18^FDScan para ver mas informacion^FS

^XZ";
    }
}
