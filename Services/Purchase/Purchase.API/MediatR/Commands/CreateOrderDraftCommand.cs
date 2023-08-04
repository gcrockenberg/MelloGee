namespace Me.Services.Purchase.API.MediatR.Commands;

public class CreateOrderDraftCommand : IRequest<OrderDraftDTO>
{
    public string BuyerId { get; private set; }

    public IEnumerable<CartItem> Items { get; private set; }

    public CreateOrderDraftCommand(string buyerId, IEnumerable<CartItem> items)
    {
        BuyerId = buyerId;
        Items = items;
    }
}
