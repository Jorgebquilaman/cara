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

public class ImportAssetItem
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Location { get; set; } = "";
    public string Department { get; set; } = "";
    public string? Description { get; set; }
}

public class ImportResult
{
    public int Created { get; set; }
    public int Skipped { get; set; }
    public int Total { get; set; }
    public List<string> Errors { get; set; } = new();
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAssetRepository _assetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssetsController(IMediator mediator, IAssetRepository assetRepository, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
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

    [HttpPost("import")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ImportResult>> Import([FromBody] List<ImportAssetItem> items)
    {
        if (items.Count == 0)
            return BadRequest(new ImportResult { Errors = { "No se proporcionaron activos." } });

        var allAssets = await _assetRepository.GetAllAsync();
        var existingCodes = new HashSet<string>(allAssets.Select(a => a.Code), StringComparer.OrdinalIgnoreCase);

        var result = new ImportResult { Total = items.Count };
        var created = 0;
        var skipped = 0;

        foreach (var item in items)
        {
            var code = (item.Code ?? "").Trim();
            if (code.Length > 50) code = code[..50];
            var name = (item.Name ?? "").Trim();
            if (name.Length > 200) name = name[..200];
            var dept = (item.Department ?? "").Trim();
            if (dept.Length > 100) dept = dept[..100];
            var loc = (item.Location ?? "").Trim();
            if (loc.Length > 200) loc = loc[..200];
            var desc = (item.Description ?? "").Trim();
            if (desc.Length > 500) desc = desc[..500];

            if (string.IsNullOrWhiteSpace(name))
            {
                result.Errors.Add($"Fila {created + skipped + 1}: Nombre vacío, se saltea.");
                skipped++;
                continue;
            }

            if (existingCodes.Contains(code))
            {
                result.Errors.Add($"Código '{code}' ya existe, se saltea.");
                skipped++;
                continue;
            }

            var asset = new Asset(code, name, "General", dept, loc, 7, desc);

            _assetRepository.Add(asset);
            existingCodes.Add(item.Code);
            created++;
        }

        if (created > 0)
            await _unitOfWork.SaveChangesAsync(default);

        result.Created = created;
        result.Skipped = skipped;
        return Ok(result);
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
