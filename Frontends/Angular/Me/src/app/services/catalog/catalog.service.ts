import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration/configuration.service';
import { DataService } from '../data/data.service';
import { Observable, tap } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { ICatalogBrand } from 'src/app/models/catalog/catalog-brand.model';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';

const baseUrl = '';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private catalogUrl: string = '';
  private brandUrl: string = '';
  private typesUrl: string = '';

  constructor(
    private _configurationService: ConfigurationService,
    private _dataService: DataService
  ) {
    this._configurationService.settingsLoaded$.subscribe(x => {
      this.catalogUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/items';
      this.brandUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/catalogbrands';
      this.typesUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/catalogtypes';
    });
  }


  getCatalog(pageIndex: number, pageSize: number, brand?: number, type?: number): Observable<ICatalog> {
    let url = this.catalogUrl;

    if (type) {
      url = this.catalogUrl + '/type/' + ((type) ? type.toString() : '') + '/brand/' + ((brand) ? brand.toString() : '');
    }
    else if (brand) {
      url = this.catalogUrl + '/type/all' + '/brand/' + ((brand) ? brand.toString() : '');
    }

    url = url + '?pageIndex=' + pageIndex + '&pageSize=' + pageSize;

    return this._dataService.get<ICatalog>(url)
      .pipe(tap((response: ICatalog) => {
        return response;
      }));
  }

  
  getBrands(): Observable<ICatalogBrand[]> {
    return this._dataService.get<ICatalogBrand[]>(this.brandUrl)
      .pipe(tap((response: ICatalogBrand[]) => {
        return response;
      }));
  }


  getTypes(): Observable<ICatalogType[]> {
    return this._dataService.get<ICatalogType[]>(this.typesUrl)
      .pipe(tap((response: ICatalogType[]) => {
        return response;
      }));
  };

}
