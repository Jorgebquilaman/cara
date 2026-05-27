using Application.DTOs;
using Application.Features.Loans.Commands.ApproveLoan;
using Application.Features.Loans.Commands.CreateLoan;
using Application.Features.Loans.Commands.RejectLoan;
using Application.Features.Loans.Commands.ReturnLoan;
using Application.Features.Loans.Commands.SendOverdueAlert;
using Application.Features.Loans.Queries.GetActiveLoans;
using Application.Features.Loans.Queries.GetManagedLoans;
using Application.Features.Loans.Queries.GetPastDueLoans;
using Application.Features.Loans.Queries.GetUserLoans;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoansController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<IReadOnlyList<LoanDto>>> GetAll()
    {
        return Ok(await _mediator.Send(new GetManagedLoansQuery()));
    }

    [HttpGet("active")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<IReadOnlyList<LoanDto>>> GetActive()
    {
        return Ok(await _mediator.Send(new GetActiveLoansQuery()));
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<LoanDto>>> GetByUser(Guid userId)
    {
        return Ok(await _mediator.Send(new GetUserLoansQuery(userId)));
    }

    [HttpPost]
    public async Task<ActionResult<LoanDto>> Create(CreateLoanCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetByUser), new { userId = result.UserId }, result);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await _mediator.Send(new ApproveLoanCommand(id, userId));
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Reject(Guid id, RejectLoanDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await _mediator.Send(new RejectLoanCommand(id, userId, dto.Reason));
        return NoContent();
    }

    [HttpGet("past-due")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<IReadOnlyList<LoanDto>>> GetPastDue()
    {
        return Ok(await _mediator.Send(new GetPastDueLoansQuery()));
    }

    [HttpPost("{id:guid}/send-overdue-alert")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> SendOverdueAlert(Guid id)
    {
        await _mediator.Send(new SendOverdueAlertCommand(id));
        return Ok();
    }

    [HttpPost("{id:guid}/return")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Return(Guid id, ReturnLoanDto dto)
    {
        await _mediator.Send(new ReturnLoanCommand(id, dto.IncidentDescription, dto.IncidentPhotoUrl));
        return NoContent();
    }

    [HttpPost("upload-incident-photo")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UploadIncidentPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not ".jpg" and not ".jpeg" and not ".png")
            return BadRequest("Only JPG/PNG files are allowed.");

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "uploads", "incidents");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/uploads/incidents/{fileName}";
        return Ok(new { url });
    }
}
