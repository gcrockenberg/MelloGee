namespace Me.Services.Purchase.Infrastructure.EntityConfigurations;

class ClientRequestEntityTypeConfiguration
    : IEntityTypeConfiguration<ClientRequest>
{
    public void Configure(EntityTypeBuilder<ClientRequest> requestConfiguration)
    {
        requestConfiguration.ToTable("requests");
        requestConfiguration.HasKey(cr => cr.Id);
        requestConfiguration.Property(cr => cr.Name).HasMaxLength(1000).IsRequired();
        requestConfiguration.Property(cr => cr.Time).IsRequired();
    }
}
