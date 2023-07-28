namespace Me.Services.Catalog.API.Data;

public class CatalogContextSeed
{
    public async Task SeedAsync(CatalogContext context, IWebHostEnvironment env, IOptions<CatalogSettings> settings, ILogger<CatalogContextSeed>? logger)
    {
        var policy = CreatePolicy(logger, nameof(CatalogContextSeed));

        await policy.ExecuteAsync(async () =>
        {
            var useCustomizationData = settings.Value.UseCustomizationData;
            var contentRootPath = env.ContentRootPath;
            var picturePath = env.WebRootPath;

            if (!context.CatalogBrands.Any())
            {
                await context.CatalogBrands.AddRangeAsync(useCustomizationData
                    ? GetCatalogBrandsFromFile(contentRootPath, logger)
                    : GetPreconfiguredCatalogBrands());

                await context.SaveChangesAsync();
            }

            if (!context.CatalogTypes.Any())
            {
                await context.CatalogTypes.AddRangeAsync(useCustomizationData
                    ? GetCatalogTypesFromFile(contentRootPath, logger)
                    : GetPreconfiguredCatalogTypes());

                await context.SaveChangesAsync();
            }

            if (!context.CatalogItems.Any())
            {
                await context.CatalogItems.AddRangeAsync(useCustomizationData
                    ? GetCatalogItemsFromFile(contentRootPath, context, logger)
                    : GetPreconfiguredItems());

                await context.SaveChangesAsync();

                GetCatalogItemPictures(contentRootPath, picturePath);
            }
        });
    }


    private IEnumerable<CatalogBrand> GetCatalogBrandsFromFile(string contentRootPath, ILogger<CatalogContextSeed>? logger)
    {
        string csvFileCatalogBrands = Path.Combine(contentRootPath, "Setup", "CatalogBrands.csv");

        if (!File.Exists(csvFileCatalogBrands))
        {
            return GetPreconfiguredCatalogBrands();
        }

        string[] csvheaders;
        try
        {
            string[] requiredHeaders = { "catalogbrand" };
            csvheaders = GetHeaders(csvFileCatalogBrands, requiredHeaders);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Error reading CSV headers");
            return GetPreconfiguredCatalogBrands();
        }

        return File.ReadAllLines(csvFileCatalogBrands)
                                    .Skip(1) // skip header row
                                    .SelectTry(CreateCatalogBrand)
                                    .OnCaughtException(ex =>
                                    {
                                        logger?.LogError(ex, "Error creating brand while seeding database");
                                        return null!;   // Skip this one
                                    })
                                    .Where(x => x != null);
    }


    private CatalogBrand CreateCatalogBrand(string brand)
    {
        brand = brand.Trim('"').Trim();

        if (string.IsNullOrEmpty(brand))
        {
            throw new Exception("Catalog Brand Name is empty");
        }

        return new CatalogBrand
        {
            Brand = brand,
        };
    }


    public static IEnumerable<CatalogBrand> GetPreconfiguredCatalogBrands()
    {
        return new List<CatalogBrand>()
        {
            new() { Brand = "Azure"},
            new() { Brand = ".NET" },
            new() { Brand = "Visual Studio" },
            new() { Brand = "SQL Server" },
            new() { Brand = "Other" },
            new() { Brand = "Fjallraven"},
            new() { Brand = "Mens Casual Premium" },
            new() { Brand = "John Hardy" },
            new() { Brand = "Elements" },
            new() { Brand = "SanDisk" },
            new() { Brand = "Silicon Power" },            
            new() { Brand = "Western Digital" },
            new() { Brand = "Acer" },
            new() { Brand = "Samsung" },
            new() { Brand = "Biylaclesen" },
            new() { Brand = "Lock and Love " },
            new() { Brand = "MBJ" },
            new() { Brand = "Opna" },
            new() { Brand = "Danvouy" },
        };
    }


    private IEnumerable<CatalogType> GetCatalogTypesFromFile(string contentRootPath, ILogger<CatalogContextSeed>? logger)
    {
        string csvFileCatalogTypes = Path.Combine(contentRootPath, "Setup", "CatalogTypes.csv");

        if (!File.Exists(csvFileCatalogTypes))
        {
            return GetPreconfiguredCatalogTypes();
        }

        string[] csvheaders;
        try
        {
            string[] requiredHeaders = { "catalogtype" };
            csvheaders = GetHeaders(csvFileCatalogTypes, requiredHeaders);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Error reading CSV headers");
            return GetPreconfiguredCatalogTypes();
        }

        return File.ReadAllLines(csvFileCatalogTypes)
                                    .Skip(1) // skip header row
                                    .SelectTry(x => CreateCatalogType(x))
                                    .OnCaughtException(ex =>
                                    {
                                        logger?.LogError(ex, "Error creating catalog type while seeding database");
                                        return null!;   // Skip this one
                                    })
                                    .Where(x => x != null);
    }


    private CatalogType CreateCatalogType(string type)
    {
        type = type.Trim('"').Trim();

        if (string.IsNullOrEmpty(type))
        {
            throw new Exception("catalog Type Name is empty");
        }

        return new CatalogType
        {
            Type = type,
        };
    }


    public static IEnumerable<CatalogType> GetPreconfiguredCatalogTypes()
    {
        return new List<CatalogType>()
        {
            new() { Type = "Mug"},
            new() { Type = "T-Shirt" },
            new() { Type = "Sheet" },
            new() { Type = "USB Memory Stick" },
            new() { Type = "Men's clothing"},
            new() { Type = "Jewelery" },
            new() { Type = "Electronics" },
            new() { Type = "Women's clothing" },
        };
    }


    private IEnumerable<CatalogItem> GetCatalogItemsFromFile(string contentRootPath, CatalogContext context, ILogger<CatalogContextSeed>? logger)
    {
        string csvFileCatalogItems = Path.Combine(contentRootPath, "Setup", "CatalogItems.csv");

        if (!File.Exists(csvFileCatalogItems))
        {
            return GetPreconfiguredItems();
        }

        string[] csvheaders;
        try
        {
            string[] requiredHeaders = { "catalogtypename", "catalogbrandname", "description", "name", "price", "picturefilename" };
            string[] optionalheaders = { "availablestock", "restockthreshold", "maxstockthreshold", "onreorder" };
            csvheaders = GetHeaders(csvFileCatalogItems, requiredHeaders, optionalheaders);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Error reading CSV headers");
            return GetPreconfiguredItems();
        }

        var catalogTypeIdLookup = context.CatalogTypes.ToDictionary(ct => ct.Type, ct => ct.Id);
        var catalogBrandIdLookup = context.CatalogBrands.ToDictionary(ct => ct.Brand, ct => ct.Id);

        return File.ReadAllLines(csvFileCatalogItems)
                    .Skip(1) // skip header row
                    .Select(row => Regex.Split(row, ",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                    .SelectTry(column => CreateCatalogItem(column, csvheaders, catalogTypeIdLookup, catalogBrandIdLookup))
                    .OnCaughtException(ex =>
                    {
                        logger?.LogError(ex, "Error creating catalog item while seeding database");
                        return null!;   // Skip this one 
                    })
                    .Where(x => x != null);
    }


    private CatalogItem CreateCatalogItem(string[] column, string[] headers, Dictionary<string, int> catalogTypeIdLookup, Dictionary<string, int> catalogBrandIdLookup)
    {
        if (column.Count() != headers.Count())
        {
            throw new Exception($"column count '{column.Count()}' not the same as headers count'{headers.Count()}'");
        }

        string catalogTypeName = column[Array.IndexOf(headers, "catalogtypename")].Trim('"').Trim();
        if (!catalogTypeIdLookup.ContainsKey(catalogTypeName))
        {
            throw new Exception($"type={catalogTypeName} does not exist in catalogTypes");
        }

        string catalogBrandName = column[Array.IndexOf(headers, "catalogbrandname")].Trim('"').Trim();
        if (!catalogBrandIdLookup.ContainsKey(catalogBrandName))
        {
            throw new Exception($"type={catalogBrandName} does not exist in catalogTypes");
        }

        string priceString = column[Array.IndexOf(headers, "price")].Trim('"').Trim();
        if (!decimal.TryParse(priceString, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out decimal price))
        {
            throw new Exception($"price={priceString}is not a valid decimal number");
        }

        var catalogItem = new CatalogItem()
        {
            CatalogTypeId = catalogTypeIdLookup[catalogTypeName],
            CatalogBrandId = catalogBrandIdLookup[catalogBrandName],
            Description = column[Array.IndexOf(headers, "description")].Trim('"').Trim(),
            Name = column[Array.IndexOf(headers, "name")].Trim('"').Trim(),
            Price = price,
            PictureFileName = column[Array.IndexOf(headers, "picturefilename")].Trim('"').Trim(),
        };

        int availableStockIndex = Array.IndexOf(headers, "availablestock");
        if (availableStockIndex != -1)
        {
            string availableStockString = column[availableStockIndex].Trim('"').Trim();
            if (!string.IsNullOrEmpty(availableStockString))
            {
                if (int.TryParse(availableStockString, out int availableStock))
                {
                    catalogItem.AvailableStock = availableStock;
                }
                else
                {
                    throw new Exception($"availableStock={availableStockString} is not a valid integer");
                }
            }
        }

        int restockThresholdIndex = Array.IndexOf(headers, "restockthreshold");
        if (restockThresholdIndex != -1)
        {
            string restockThresholdString = column[restockThresholdIndex].Trim('"').Trim();
            if (!string.IsNullOrEmpty(restockThresholdString))
            {
                if (int.TryParse(restockThresholdString, out int restockThreshold))
                {
                    catalogItem.RestockThreshold = restockThreshold;
                }
                else
                {
                    throw new Exception($"restockThreshold={restockThreshold} is not a valid integer");
                }
            }
        }

        int maxStockThresholdIndex = Array.IndexOf(headers, "maxstockthreshold");
        if (maxStockThresholdIndex != -1)
        {
            string maxStockThresholdString = column[maxStockThresholdIndex].Trim('"').Trim();
            if (!string.IsNullOrEmpty(maxStockThresholdString))
            {
                if (int.TryParse(maxStockThresholdString, out int maxStockThreshold))
                {
                    catalogItem.MaxStockThreshold = maxStockThreshold;
                }
                else
                {
                    throw new Exception($"maxStockThreshold={maxStockThreshold} is not a valid integer");
                }
            }
        }

        int onReorderIndex = Array.IndexOf(headers, "onreorder");
        if (onReorderIndex != -1)
        {
            string onReorderString = column[onReorderIndex].Trim('"').Trim();
            if (!string.IsNullOrEmpty(onReorderString))
            {
                if (bool.TryParse(onReorderString, out bool onReorder))
                {
                    catalogItem.OnReorder = onReorder;
                }
                else
                {
                    throw new Exception($"onReorder={onReorderString} is not a valid boolean");
                }
            }
        }

        return catalogItem;
    }

// type 
// Men's Clothing = 5
// Jewelry = 6
// Electronics = 7
// Woman's clothing = 8

// brand 
// Fjallraven = 6
// Mens Casual Premium = 7
// John Hardy = 8
// Elements = 9
// SanDisk = 10
// Silicon Power = 11
// Western Digital = 12
// Acer = 13
// Samsung = 14
// BIYACLEESON = 15
// Lock and Love = 16
// MBJ = 17
// Opna = 18
// DANVOUY = 19
    public static IEnumerable<CatalogItem> GetPreconfiguredItems()
    {
        return new List<CatalogItem>()
        {
            new() { CatalogTypeId = 2, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Bot Black Hoodie", Name = ".NET Bot Black Hoodie", Price = 19.5M, PictureFileName = "1.png" },
            new() { CatalogTypeId = 1, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Black & White Mug", Name = ".NET Black & White Mug", Price= 8.50M, PictureFileName = "2.png" },
            new() { CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Prism White T-Shirt", Name = "Prism White T-Shirt", Price = 12, PictureFileName = "3.png" },
            new() { CatalogTypeId = 2, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Foundation T-shirt", Name = ".NET Foundation T-shirt", Price = 12, PictureFileName = "4.png" },
            new() { CatalogTypeId = 3, CatalogBrandId = 5, AvailableStock = 100, Description = "Roslyn Red Sheet", Name = "Roslyn Red Sheet", Price = 8.5M, PictureFileName = "5.png" },
            new() { CatalogTypeId = 2, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Blue Hoodie", Name = ".NET Blue Hoodie", Price = 12, PictureFileName = "6.png" },
            new() { CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Roslyn Red T-Shirt", Name = "Roslyn Red T-Shirt", Price = 12, PictureFileName = "7.png" },
            new() { CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Kudu Purple Hoodie", Name = "Kudu Purple Hoodie", Price = 8.5M, PictureFileName = "8.png" },
            new() { CatalogTypeId = 1, CatalogBrandId = 5, AvailableStock = 100, Description = "Cup<T> White Mug", Name = "Cup<T> White Mug", Price = 12, PictureFileName = "9.png" },
            new() { CatalogTypeId = 3, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Foundation Sheet", Name = ".NET Foundation Sheet", Price = 12, PictureFileName = "10.png" },
            new() { CatalogTypeId = 3, CatalogBrandId = 2, AvailableStock = 100, Description = "Cup<T> Sheet", Name = "Cup<T> Sheet", Price = 8.5M, PictureFileName = "11.png" },
            new() { CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Prism White TShirt", Name = "Prism White TShirt", Price = 12, PictureFileName = "12.png" },
            new() { CatalogTypeId = 5, CatalogBrandId = 6, AvailableStock = 100, Description = "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday", Name = "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops", Price = 109.95M, PictureFileName = "15.png" },
            new() { CatalogTypeId = 5, CatalogBrandId = 7, AvailableStock = 100, Description = "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.", Name = "Slim Fit T-Shirts", Price = 22.3M, PictureFileName = "16.png" },
            new() { CatalogTypeId = 5, CatalogBrandId = 7, AvailableStock = 100, Description = "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.", Name = "Mens Cotton Jacket", Price = 55.99M, PictureFileName = "17.png" },
            new() { CatalogTypeId = 5, CatalogBrandId = 7, AvailableStock = 100, Description = "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.", Name = "Mens Casual Slim Fit", Price = 15.99M, PictureFileName = "18.png" },
            new() { CatalogTypeId = 6, CatalogBrandId = 8, AvailableStock = 100, Description = "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.", Name = "Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet", Price = 695M, PictureFileName = "19.png" },
            new() { CatalogTypeId = 6, CatalogBrandId = 8, AvailableStock = 100, Description = "Satisfaction Guaranteed. Return or exchange any order within 30 days.Designed and sold by Hafeez Center in the United States. Satisfaction Guaranteed. Return or exchange any order within 30 days.", Name = "Solid Gold Petite Micropave", Price = 168M, PictureFileName = "20.png" },
            new() { CatalogTypeId = 6, CatalogBrandId = 8, AvailableStock = 100, Description = "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to spoil your love more for Engagement, Wedding, Anniversary, Valentine's Day...", Name = "White Gold Plated Princess", Price = 9.99M, PictureFileName = "21.png" },
            new() { CatalogTypeId = 6, CatalogBrandId = 8, AvailableStock = 100, Description = "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel", Name = "Pierced Owl Rose Gold Plated Stainless Steel Double", Price = 10.99M, PictureFileName = "22.png" },
            new() { CatalogTypeId = 7, CatalogBrandId = 9, AvailableStock = 100, Description = "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7; Reformatting may be required for other operating systems; Compatibility may vary depending on user’s hardware configuration and operating system", Name = "2TB Portable External Hard Drive - USB 3.0", Price = 64M, PictureFileName = "23.png" },
            new() { CatalogTypeId = 7, CatalogBrandId = 10, AvailableStock = 100, Description = "Easy upgrade for faster boot up, shutdown, application load and response (As compared to 5400 RPM SATA 2.5” hard drive; Based on published specifications and internal benchmarking tests using PCMark vantage scores) Boosts burst write performance, making it ideal for typical PC workloads The perfect balance of performance and reliability Read/write speeds of up to 535MB/s/450MB/s (Based on internal testing; Performance may vary depending upon drive capacity, host device, OS and application.)", Name = "SD PLUS 1TB Internal SSD - SATA III 6 Gb/s", Price = 109M, PictureFileName = "24.png" },
            new() { CatalogTypeId = 7, CatalogBrandId = 11, AvailableStock = 100, Description = "3D NAND flash are applied to deliver high transfer speeds Remarkable transfer speeds that enable faster bootup and improved overall system performance. The advanced SLC Cache Technology allows performance boost and longer lifespan 7mm slim design suitable for Ultrabooks and Ultra-slim notebooks. Supports TRIM command, Garbage Collection technology, RAID, and ECC (Error Checking & Correction) to provide the optimized performance and enhanced reliability.", Name = "256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5", Price = 109M, PictureFileName = "25.png" },
            new() { CatalogTypeId = 7, CatalogBrandId = 12, AvailableStock = 100, Description = "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer's limited warranty", Name = "4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive", Price = 114M, PictureFileName = "26.png" },
            new() { CatalogTypeId = 7, CatalogBrandId = 13, AvailableStock = 100, Description = "21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology. No compatibility for VESA Mount Refresh Rate: 75Hz - Using HDMI port Zero-frame design | ultra-thin | 4ms response time | IPS panel Aspect ratio - 16: 9. Color Supported - 16. 7 million colors. Brightness - 250 nit Tilt angle -5 degree to 15 degree. Horizontal viewing angle-178 degree. Vertical viewing angle-178 degree 75 hertz", Name = "SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin", Price = 599M, PictureFileName = "27.png" },
            new() { CatalogTypeId = 7, CatalogBrandId = 14, AvailableStock = 100, Description = "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by side QUANTUM DOT (QLED) TECHNOLOGY, HDR support and factory calibration provides stunningly realistic and accurate color and contrast 144HZ HIGH REFRESH RATE and 1ms ultra fast response time work to eliminate motion blur, ghosting, and reduce input lag", Name = "49-Inch CHG90 144Hz Curved Gaming Monitor (LC49HG90DMNXZA) – Super Ultrawide Screen QLED", Price = 999.99M, PictureFileName = "28.png" },
            new() { CatalogTypeId = 8, CatalogBrandId = 15, AvailableStock = 100, Description = "Note:The Jackets is US standard size, Please choose size as your usual wear Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece. Detachable Functional Liner: Skin Friendly, Lightweigt and Warm.Stand Collar Liner jacket, keep you warm in cold weather. Zippered Pockets: 2 Zippered Hand Pockets, 2 Zippered Pockets on Chest (enough to keep cards or keys)and 1 Hidden Pocket Inside.Zippered Hand Pockets and Hidden Pocket keep your things secure. Humanized Design: Adjustable and Detachable Hood and Adjustable cuff to prevent the wind and water,for a comfortable fit. 3 in 1 Detachable Design provide more convenience, you can separate the coat and inner as needed, or wear it together. It is suitable for different season and help you adapt to different climates", Name = "Women's 3-in-1 Snowboard Jacket Winter Coats", Price = 56.99M, PictureFileName = "29.png" },
            new() { CatalogTypeId = 8, CatalogBrandId = 16, AvailableStock = 100, Description = "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (SWEATER), Faux leather material for style and comfort / 2 pockets of front, 2-For-One Hooded denim style faux leather jacket, Button detail on waist / Detail stitching at sides, HAND WASH ONLY / DO NOT BLEACH / LINE DRY / DO NOT IRON", Name = "Women's Removable Hooded Faux Leather Moto Biker Jacket", Price = 29.95M, PictureFileName = "30.png" },
            new() { CatalogTypeId = 8, CatalogBrandId = 16, AvailableStock = 100, Description = "Lightweight perfet for trip or casual wear---Long sleeve with hooded, adjustable drawstring waist design. Button and zipper front closure raincoat, fully stripes Lined and The Raincoat has 2 side pockets are a good size to hold all kinds of things, it covers the hips, and the hood is generous but doesn't overdo it.Attached Cotton Lined Hood with Adjustable Drawstrings give it a real styled look.", Name = "Rain Jacket Women Windbreaker Striped Climbing Raincoats", Price = 39.99M, PictureFileName = "31.png" },
            new() { CatalogTypeId = 8, CatalogBrandId = 17, AvailableStock = 100, Description = "95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline / Double stitching on bottom hem", Name = "Women's Solid Short Sleeve Boat Neck V", Price = 12, PictureFileName = "32.png" },
            new() { CatalogTypeId = 8, CatalogBrandId = 18, AvailableStock = 100, Description = "100% Polyester, Machine wash, 100% cationic polyester interlock, Machine Wash & Pre Shrunk for a Great Fit, Lightweight, roomy and highly breathable with moisture wicking fabric which helps to keep moisture away, Soft Lightweight Fabric with comfortable V-neck collar and a slimmer fit, delivers a sleek, more feminine silhouette and Added Comfort", Name = "Women's Short Sleeve Moisture", Price = 7.95M, PictureFileName = "33.png" },
            new() { CatalogTypeId = 8, CatalogBrandId = 19, AvailableStock = 100, Description = "95%Cotton,5%Spandex, Features: Casual, Short Sleeve, Letter Print,V-Neck,Fashion Tees, The fabric is soft and has some stretch., Occasion: Casual/Office/Beach/School/Home/Street. Season: Spring,Summer,Autumn,Winter.", Name = "Womens T Shirt Casual Cotton Short", Price = 12.99M, PictureFileName = "34.png" },
        };
    }


    private string[] GetHeaders(string csvfile, string[] requiredHeaders, string[] optionalHeaders = null!)
    {
        optionalHeaders ??= new string[0];
        string[] csvheaders = File.ReadLines(csvfile).First().ToLowerInvariant().Split(',');

        if (csvheaders.Count() < requiredHeaders.Count())
        {
            throw new Exception($"requiredHeader count '{requiredHeaders.Count()}' is bigger then csv header count '{csvheaders.Count()}' ");
        }

        if (csvheaders.Count() > (requiredHeaders.Count() + optionalHeaders.Count()))
        {
            throw new Exception($"csv header count '{csvheaders.Count()}'  is larger then required '{requiredHeaders.Count()}' and optional '{optionalHeaders.Count()}' headers count");
        }

        foreach (var requiredHeader in requiredHeaders)
        {
            if (!csvheaders.Contains(requiredHeader))
            {
                throw new Exception($"does not contain required header '{requiredHeader}'");
            }
        }

        return csvheaders;
    }


    private void GetCatalogItemPictures(string contentRootPath, string picturePath)
    {
        if (picturePath != null)
        {
            DirectoryInfo directory = new DirectoryInfo(picturePath);
            foreach (FileInfo file in directory.GetFiles())
            {
                file.Delete();
            }

            string zipFileCatalogItemPictures = Path.Combine(contentRootPath, "Setup", "CatalogItems.zip");
            ZipFile.ExtractToDirectory(zipFileCatalogItemPictures, picturePath);
        }
    }


    private AsyncRetryPolicy CreatePolicy(ILogger<CatalogContextSeed>? logger, string prefix, int retries = 3)
    {
        return Policy.Handle<SqlException>().
            WaitAndRetryAsync(
                retryCount: retries,
                sleepDurationProvider: retry => TimeSpan.FromSeconds(5),
                onRetry: (exception, timeSpan, retry, ctx) =>
                {
                    logger?.LogWarning(exception, "[{prefix}] Error seeding database (attempt {retry} of {retries})", prefix, retry, retries);
                }
            );
    }
}
