using CatalogService.Database;
using CatalogService.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CatalogController : ControllerBase
    {
        Context _db;

        public CatalogController(Context db)
        {
            _db = db;
        }


        [HttpGet(Name = "GetProducts")]
        public IEnumerable<Product> Get()
        {
            return _db.Products.ToArray();
        }
    }
}
