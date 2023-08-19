namespace Me.Services.Purchase.Infrastructure.EntityConfigurations;

class OrderEntityTypeConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> orderConfiguration)
    {
        orderConfiguration.ToTable("orders");

        orderConfiguration.HasKey(o => o.Id);

        orderConfiguration.Ignore(b => b.DomainEvents);

        orderConfiguration.Property(o => o.Id)
            //.ValueGeneratedOnAdd();
            .UseHiLo("orderseq");

        //Address value object persisted as owned entity type supported since EF Core 2.0
        orderConfiguration
            .OwnsOne(o => o.Address, a =>
            {
                // Explicit configuration of the shadow key property in the owned type 
                // as a workaround for a documented issue in EF Core 5: https://github.com/dotnet/efcore/issues/20740
                a.Property<int>("OrderId")
                .UseHiLo("orderseq");
                a.WithOwner();
            });

        orderConfiguration.HasOne(e => e.Buyer)
        .WithMany(e => e.Orders)
        .HasForeignKey(e => e.BuyerId);

        orderConfiguration.HasOne(e => e.OrderStatus)
        .WithMany(e => e.Orders)
        .HasForeignKey(e => e.OrderStatusId);

        orderConfiguration.HasOne(e => e.PaymentMethod)
        .WithMany(e => e.Orders)
        .HasForeignKey(e => e.PaymentMethodId);

        orderConfiguration
            .Property<DateTime>("OrderDate")
            .IsRequired();

        orderConfiguration.Property<string>("Description").IsRequired(false);

        var navigation = orderConfiguration.Metadata.FindNavigation(nameof(Order.OrderItems));

        // DDD Patterns comment:
        //Set as field (New since EF 1.1) to access the OrderItem collection property through its field
        navigation.SetPropertyAccessMode(PropertyAccessMode.Field);

    }
}
