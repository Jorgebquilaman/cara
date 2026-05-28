using Application.Common.Interfaces;
using Application.Features.Surveys.Commands.CreateSurvey;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/surveys")]
[Authorize]
public class SurveysController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public SurveysController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetPending()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var pendingLoans = await _context.Loans
            .Where(l => l.UserId == userId && 
                        l.Status == Domain.Enums.LoanStatus.Returned &&
                        !_context.SatisfactionSurveys.Any(s => s.LoanId == l.Id))
            .Include(l => l.Asset)
            .ToListAsync();

        return Ok(pendingLoans.Select(l => new { l.Id, l.Asset.Name }));
    }

    [HttpGet("completed")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetCompleted()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var surveys = await _context.SatisfactionSurveys
            .Where(s => s.Loan.UserId == userId)
            .Include(s => s.Loan)
                .ThenInclude(l => l.Asset)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(surveys.Select(s => new
        {
            s.Id,
            s.LoanId,
            AssetName = s.Loan.Asset.Name,
            s.OverallRating,
            s.ServiceRating,
            s.RequestTimeRating,
            s.AssetQualityRating,
            s.Comments,
            s.CreatedAt
        }));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateSurveyCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(id);
    }
}