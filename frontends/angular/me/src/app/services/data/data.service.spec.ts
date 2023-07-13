import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { asyncData } from 'src/app/testing/async-observable-helpers';

describe('DataService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let dataService: DataService;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    dataService = new DataService(httpClientSpy);
  });

  it('should be created', () => {
    expect(dataService).toBeTruthy();
  });

  it('should return expected configuration (HttpClient called once)', (done: DoneFn) => {
    let catalogItem: ICatalogItem = {
      id: 1,
      name: 'name',
      description: 'description',
      price: 1,
      units: 1,
      catalogBrand: 'brand',
      catalogBrandId: 1,
      catalogType: 'type',
      catalogTypeId: 1,
      pictureUri: 'uri'
    }
    // Simulate http serialization
    httpClientSpy.get.and.returnValue(
      asyncData(JSON.parse(JSON.stringify(catalogItem)) as ICatalogItem)
    );

    // Url doesn't matter, intercepted by spy
    dataService.get<ICatalogItem>('http://localhost/c/api/v1/catalog/items')
      .subscribe({
        next: async result => {
          console.log(`--> Result IS catalogItem: ${result === catalogItem}`);

          expect(result)
            .withContext('expected catalog item')
            .toEqual(jasmine.objectContaining(catalogItem));

          catalogItem.id = 2;
          expect(result)
            .withContext('not expected catalog item')
            .not
            .toEqual(jasmine.objectContaining(catalogItem));
          
          done();
        },
        error: done.fail
      });

    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });
});
