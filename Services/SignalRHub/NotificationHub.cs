namespace Me.Services.SignalRHub;

[Authorize]
public class NotificationsHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, Context.User.Identity.Name);
        await base.OnConnectedAsync();

        Console.WriteLine("--> OnConnectedAsync()");
        Clients.Caller.SendAsync("UpdatedOrderState", new { OrderId = 0, Status = "connected ..." });
    }

    public override async Task OnDisconnectedAsync(Exception ex)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.User.Identity.Name);
        await base.OnDisconnectedAsync(ex);
    }
}