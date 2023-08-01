using Me.Services.Catalog.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Me.Services.Catalog.API.Data.EntityConfigurations;

class CatalogBrandEntityTypeConfiguration
    : IEntityTypeConfiguration<CatalogBrand>
{
    public void Configure(EntityTypeBuilder<CatalogBrand> builder)
    {
        builder.ToTable("CatalogBrand");

        builder.HasKey(ci => ci.Id);  // When using InMemoryDb

        builder.Property(ci => ci.Id)
            .UseHiLo("CatalogBrandSequence")
            .IsRequired();

        builder.Property(cb => cb.Brand)
            .IsRequired()
            .HasMaxLength(100);
    }
}
