using Me.Services.Coffee.API.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Me.Services.Coffee.API.Data.EntityConfigurations;

class CoffeeItemEntityTypeConfiguration
    : IEntityTypeConfiguration<CoffeeItem>
{
    public void Configure(EntityTypeBuilder<CoffeeItem> builder)
    {
        builder.ToTable("CoffeeItem");

        builder.HasKey(ci => ci.Id);

        builder.Property(ci => ci.Id)
            .HasDefaultValueSql("NEXT VALUE FOR CoffeeSequence")
            .IsRequired();

        builder.Property(ci => ci.Name)
            .IsRequired()
            .HasMaxLength(100);
    }
}
