namespace Me.Services.Purchase.API.MediatR.Commands;

public class SetAwaitingValidationOrderStatusCommand : IRequest<bool>
{

    [DataMember]
    public int OrderNumber { get; private set; }

    public SetAwaitingValidationOrderStatusCommand(int orderNumber)
    {
        OrderNumber = orderNumber;
    }
}
