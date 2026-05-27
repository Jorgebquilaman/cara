using System.Security.Claims;
using Application.Common.Interfaces;
using Application.DTOs;
using Application.Features.Notifications.Commands.SendReminder;
using AutoMapper;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;

    public NotificationsController(IApplicationDbContext context, IMapper mapper, IMediator mediator)
    {
        _context = context;
        _mapper = mapper;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetUserNotifications()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.SentAt)
            .ToListAsync();

        return Ok(_mapper.Map<List<NotificationDto>>(notifications));
    }

    [HttpPost("remind/{loanId}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult> SendReminder(Guid loanId)
    {
        await _mediator.Send(new SendReminderCommand(loanId));
        return Ok();
    }
}
