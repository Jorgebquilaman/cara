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
    private readonly IUnitOfWork _unitOfWork;

    public NotificationsController(IApplicationDbContext context, IMapper mapper, IMediator mediator, IUnitOfWork unitOfWork)
    {
        _context = context;
        _mapper = mapper;
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var count = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        return Ok(new { count });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserNotifications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        var totalCount = await query.CountAsync();
        
        var notifications = await query
            .OrderByDescending(n => n.SentAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new 
        {
            Items = _mapper.Map<List<NotificationDto>>(notifications),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound();

        notification.MarkAsRead();
        await _unitOfWork.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound();

        _context.Notifications.Remove(notification);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
            n.MarkAsRead();

        await _unitOfWork.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("remind/{loanId}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult> SendReminder(Guid loanId)
    {
        await _mediator.Send(new SendReminderCommand(loanId));
        return Ok();
    }
}
