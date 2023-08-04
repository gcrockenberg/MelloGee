namespace Me.Services.Purchase.API.MediatR.Commands;

public class SetStockConfirmedOrderStatusCommand : IRequest<bool>
{

    [DataMember]
    public int OrderNumber { get; private set; }

    public SetStockConfirmedOrderStatusCommand(int orderNumber)
    {
        OrderNumber = orderNumber;
    }
}
