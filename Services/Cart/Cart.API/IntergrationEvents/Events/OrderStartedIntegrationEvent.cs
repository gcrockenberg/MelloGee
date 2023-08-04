namespace Me.Cart.API.IntegrationEvents.Events;

// Integration Events notes:
// An Event is "something that has happened in the past", therefore its name has to be
// An Integration Event is an event that can cause side effects to other microservices, Bounded-Contexts or external systems.
public record OrderStartedIntegrationEvent : IntegrationEvent
{
    public string UserId { get; init; }

    /// <summary>
    /// The Cart from which the Order was created
    /// </summary>
    public string SourceCartSessionId { get; }


    public OrderStartedIntegrationEvent(string userId, string sourceCartSessionId)
    {
        UserId = userId;
        SourceCartSessionId = sourceCartSessionId;
    }
     
}
