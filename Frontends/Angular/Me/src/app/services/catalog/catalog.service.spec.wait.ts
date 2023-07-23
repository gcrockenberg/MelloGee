import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { HttpClient } from '@angular/common/http';

import config from 'src/assets.dev/config.me.json';

import { CatalogService } from './catalog.service';
import { DataService } from '../data/data.service';
import { asyncData } from 'src/app/testing/async-observable-helpers';

import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { firstValueFrom } from 'rxjs';


describe('CatalogService', () => {
  let catalogService: CatalogService;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let mockDataService: DataService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    mockDataService = new DataService(httpClientSpy);

    // For ConfigurationService
    // Simulate http serialization
    httpClientSpy.get.and.returnValue(
      asyncData(JSON.parse(JSON.stringify(config)))
    );

    TestBed.configureTestingModule({
      providers: [
        CatalogService,
        { provide: HttpClient, useValue: httpClientSpy}
      ]
      //imports: [HttpClientTestingModule]
    });
    
    //TestBed.inject(HttpClient);
    catalogService = TestBed.inject(CatalogService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });


  it('should be created', () => {
    expect(catalogService).toBeTruthy();
  });


  it('should return Catalog', async () => {
    let catalog: ICatalog = {
      count: 1,
      data: [
        {
          id: 1,
          name: 'Catalog Item Name',
          price: 9.99,
          description: 'Catalog item description',
          pictureUri: 'pic1.png',
          units: 10,
          catalogTypeId: 1,
          catalogType: {
            id: 1,
            type: 'Type'
          },
          catalogBrandId: 1,
          catalogBrand: {
            id: 1,
            brand: 'Brand'
          }
        }
      ],
      pageIndex: 1,
      pageSize: 6
    }

    // For DataService
    // Simulate http serialization
    httpClientSpy.get.and.returnValue(
      asyncData(JSON.parse(JSON.stringify(catalog)))
    );

    let catalogResult: ICatalog = await firstValueFrom(catalogService.getCatalog(12, 0));

    expect(catalogResult).toBeTruthy();
    expect(catalogResult.data[0].catalogType.type).toBe('Type');
  });
});
