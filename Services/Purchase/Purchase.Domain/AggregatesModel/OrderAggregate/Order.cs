using System.Runtime.Intrinsics.X86;

namespace Me.Services.Purchase.Domain.AggregatesModel.OrderAggregate;

public class Order
    : Entity, IAggregateRoot
{
    // DDD Patterns comment
    // Using private fields, allowed since EF Core 1.1, is a much better encapsulation
    // aligned with DDD Aggregates and Domain Entities (Instead of properties and property collections)
    public DateTime OrderDate { get; private set; }

    // Address is a Value Object pattern example persisted as EF Core 2.0 owned entity
    public Address Address { get; private set; }

    public int BuyerId { get; private set; }
    public virtual Buyer Buyer { get; private set; }


    public int PaymentMethodId { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }



    public int OrderStatusId { get; private set; }
    public virtual OrderStatus OrderStatus { get; set; }


    public string Description { get; private set; } = string.Empty;



    // Draft orders have this set to true. Currently we don't check anywhere the draft status of an Order, but we could do it if needed
    private bool _isDraft;

    // DDD Patterns comment
    // Using a private collection field, better for DDD Aggregate's encapsulation
    // so OrderItems cannot be added from "outside the AggregateRoot" directly to the collection,
    // but only through the method OrderAggrergateRoot.AddOrderItem() which includes behaviour.
    private readonly List<OrderItem> _orderItems;
    public IReadOnlyCollection<OrderItem> OrderItems => _orderItems;

    public string StripeMode { get; private set; } = string.Empty;

    public string RedirectUrl { get; private set; } = string.Empty;

    public string ClientSecret { get; private set; } = string.Empty;


    public static Order NewDraft()
    {
        var order = new Order();
        order._isDraft = true;
        return order;
    }


    protected Order()
    {
        _orderItems = new List<OrderItem>();
        _isDraft = false;
    }


    public Order(string userId, string userName, Address address, int cardTypeId, string cardNumber, string cardSecurityNumber,
            string cardHolderName, DateTime cardExpiration, string stripeMode, string redirectUrl, string clientSecret) : this()
    {
        //_buyerId = buyerId;
        //_paymentMethodId = paymentMethodId;
        OrderStatusId = OrderStatus.Submitted.Id;
        OrderDate = DateTime.UtcNow;
        Address = address;
        StripeMode = stripeMode;
        RedirectUrl = redirectUrl;
        ClientSecret = clientSecret;

        // Add the OrderStarterDomainEvent to the domain events collection 
        // to be raised/dispatched when comitting changes into the Database [ After DbContext.SaveChanges() ]
        AddOrderStartedDomainEvent(userId, userName, cardTypeId, cardNumber,
                                    cardSecurityNumber, cardHolderName, cardExpiration);
    }


    // DDD Patterns comment
    // This Order AggregateRoot's method "AddOrderitem()" should be the only way to add Items to the Order,
    // so any behavior (discounts, etc.) and validations are controlled by the AggregateRoot 
    // in order to maintain consistency between the whole Aggregate. 
    public void AddOrderItem(int productId, string productName, decimal unitPrice, decimal discount, string pictureUrl, int units = 1)
    {
        var existingOrderForProduct = _orderItems.Where(o => o.ProductId == productId)
            .SingleOrDefault();

        if (existingOrderForProduct != null)
        {
            //if previous line exist modify it with higher discount  and units..

            if (discount > existingOrderForProduct.GetCurrentDiscount())
            {
                existingOrderForProduct.SetNewDiscount(discount);
            }

            existingOrderForProduct.AddUnits(units);
        }
        else
        {
            //add validated new order item

            var orderItem = new OrderItem(productId, productName, unitPrice, discount, pictureUrl, units);
            _orderItems.Add(orderItem);
        }
    }


    public decimal GetTotal()
    {
        return _orderItems.Sum(o => o.GetUnits() * o.GetUnitPrice());
    }


    public void SetAwaitingValidationStatus()
    {
        if (OrderStatusId == OrderStatus.Submitted.Id)
        {
            AddDomainEvent(new OrderStatusChangedToAwaitingValidationDomainEvent(Id, _orderItems));
            OrderStatusId = OrderStatus.AwaitingValidation.Id;
        }
    }


    public void SetPaymentMethod(PaymentMethod paymentMethod)
    {
        PaymentMethod = paymentMethod;
        PaymentMethodId = paymentMethod.Id;
    }


    public void SetBuyer(Buyer buyer)
    {
        Buyer = buyer;
        BuyerId = buyer.Id;
    }


    public void SetCheckoutData(CheckoutData checkoutDetails)
    {
        switch (checkoutDetails.StripeMode.ToLower())
        {
            case STRIPE_MODE_INTENT:
                if (string.IsNullOrWhiteSpace(checkoutDetails.ClientSecret))
                    throw new PurchaseDomainException($"Stripe mode: {checkoutDetails.StripeMode} missing client secret");
                break;
            case STRIPE_MODE_REDIRECT:
                if (string.IsNullOrWhiteSpace(checkoutDetails.Url))
                    throw new PurchaseDomainException($"Stripe mode: {checkoutDetails.StripeMode} missing redirect url");
                break;
            default:
                throw new PurchaseDomainException($"Invalid Stripe mode: {checkoutDetails.StripeMode}");
        }
        StripeMode = checkoutDetails.StripeMode.ToLowerInvariant();
        RedirectUrl = checkoutDetails.Url;
        ClientSecret = checkoutDetails.ClientSecret;
    }


    public void SetPaidStatus()
    {
        if (OrderStatusId == OrderStatus.StockConfirmed.Id)
        {
            AddDomainEvent(new OrderStatusChangedToPaidDomainEvent(Id, OrderItems));

            OrderStatusId = OrderStatus.Paid.Id;
            Description = "The payment was performed at a simulated \"American Bank checking bank account ending on XX35071\"";
        }
    }


    public void SetStockConfirmedStatus()
    {
        if (OrderStatusId == OrderStatus.AwaitingValidation.Id)
        {
            AddDomainEvent(new OrderStatusChangedToStockConfirmedDomainEvent(Id));

            OrderStatusId = OrderStatus.StockConfirmed.Id;
            Description = "All the items were confirmed with available stock.";
        }
    }


    public void SetShippedStatus()
    {
        if (OrderStatusId != OrderStatus.Paid.Id)
        {
            StatusChangeException(OrderStatus.Shipped);
        }

        OrderStatusId = OrderStatus.Shipped.Id;
        Description = "The order was shipped.";
        AddDomainEvent(new OrderShippedDomainEvent(this));
    }


    public void SetCancelledStatus()
    {
        if (OrderStatusId == OrderStatus.Paid.Id ||
            OrderStatusId == OrderStatus.Shipped.Id)
        {
            StatusChangeException(OrderStatus.Cancelled);
        }

        OrderStatusId = OrderStatus.Cancelled.Id;
        Description = $"The order was cancelled.";
        AddDomainEvent(new OrderCancelledDomainEvent(this));
    }


    public void SetCancelledStatusWhenStockIsRejected(IEnumerable<int> orderStockRejectedItems)
    {
        if (OrderStatusId == OrderStatus.AwaitingValidation.Id)
        {
            OrderStatusId = OrderStatus.Cancelled.Id;

            var itemsStockRejectedProductNames = OrderItems
                .Where(c => orderStockRejectedItems.Contains(c.ProductId))
                .Select(c => c.GetOrderItemProductName());

            var itemsStockRejectedDescription = string.Join(", ", itemsStockRejectedProductNames);
            Description = $"The product items don't have stock: ({itemsStockRejectedDescription}).";
        }
    }


    private void AddOrderStartedDomainEvent(string userId, string userName, int cardTypeId, string cardNumber,
            string cardSecurityNumber, string cardHolderName, DateTime cardExpiration)
    {
        var orderStartedDomainEvent = new OrderStartedDomainEvent(this, userId, userName, cardTypeId,
                                                                    cardNumber, cardSecurityNumber,
                                                                    cardHolderName, cardExpiration);

        this.AddDomainEvent(orderStartedDomainEvent);
    }


    private void StatusChangeException(OrderStatus orderStatusToChange)
    {
        throw new PurchaseDomainException($"Is not possible to change the order status from {OrderStatus.Name} to {orderStatusToChange.Name}.");
    }


}
