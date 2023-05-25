using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CatalogService.Model
{
    public class Product
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Description { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }
    }
}
