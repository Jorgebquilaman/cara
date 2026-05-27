using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WebAPI.Hubs;

[Authorize]
public class LoanHub : Hub
{
    public async Task JoinLoanGroup(string loanId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"loan_{loanId}");
    }

    public async Task LeaveLoanGroup(string loanId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"loan_{loanId}");
    }

    public async Task NotifyStatusChange(string loanId, string newStatus)
    {
        await Clients.Group($"loan_{loanId}").SendAsync("LoanStatusChanged", loanId, newStatus);
    }

    public override async Task OnConnectedAsync()
    {
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role is "Admin" or "Staff")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "moderators");
        }
        await base.OnConnectedAsync();
    }
}
