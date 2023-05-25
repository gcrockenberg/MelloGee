using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.CodeDom;
using CatalogService.Model;

namespace CatalogService.Database
{
    public class Context: DbContext
    {
        public DbSet<Product> Products { get; set; }


        public Context(DbContextOptions<Context> options) : base(options)
        {
        }
    }

}
