import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration/configuration.service';
import { DataService } from '../data/data.service';
import { Observable, switchMap, tap } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { ICatalogBrand } from 'src/app/models/catalog/catalog-brand.model';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';

const urlPrefix = '/c/api/v1/catalog/';
//const urlPrefix = '/api/v1/catalog/';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private _catalogUrl: string = '';
  private _brandsUrl: string = '';
  private _typesUrl: string = '';

  constructor(
    private _configurationService: ConfigurationService,
    private _dataService: DataService,
  ) {
    if (_configurationService.isReady) {
      this._catalogUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'items';
      this._brandsUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'catalogbrands';
      this._typesUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'catalogtypes';
    } else {
      this._configurationService.settingsLoaded$.subscribe(x => {
        this._catalogUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'items';
        this._brandsUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'catalogbrands';
        this._typesUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'catalogtypes';
      });
    }
  }


  /**
   * @param pageIndex 
   * @param pageSize 
   * @param typeId Start at 1
   * @param brandId Start at 1
   * @returns 
   */
  getCatalog(pageIndex: number, pageSize: number, typeId?: number, brandId?: number): Observable<ICatalog> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getCatalog(pageIndex, pageSize, typeId, brandId)))
    }

    let url = this._catalogUrl;
    url = `${url}/type/${typeId ? typeId : -1}/brand/${brandId ? brandId : -1}`
    url = `${url}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this._dataService.get<ICatalog>(url)
      .pipe(tap((response: ICatalog) => {
        response.data.forEach(item => item.isNew = (Math.random() < 0.15));
        return response;
      }));
  }


  searchCatalog(pageIndex: number, pageSize: number, searchTerm: string): Observable<ICatalog> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.searchCatalog(pageIndex, pageSize, searchTerm)))
    }

    let url = `${this._catalogUrl}/search/${searchTerm}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this._dataService.get<ICatalog>(url)
      .pipe(tap((response: ICatalog) => {
        response.data.forEach(item => item.isNew = (Math.random() < 0.15));
        return response;
      }));
  }


  getCatalogItem(itemId: number): Observable<ICatalogItem> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getCatalogItem(itemId)))
    }

    let url = this._catalogUrl + `/${itemId}`;

    return this._dataService.get<ICatalogItem>(url)
      .pipe(tap((response: ICatalogItem) => {
        return response;
      }));
  }


  getBrands(): Observable<ICatalogBrand[]> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getBrands()))
    }

    return this._dataService.get<ICatalogBrand[]>(this._brandsUrl)
      .pipe(tap((response: ICatalogBrand[]) => {
        return response;
      }));
  }


  getTypes(): Observable<ICatalogType[]> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getTypes()))
    }

    return this._dataService.get<ICatalogType[]>(this._typesUrl)
      .pipe(tap((response: ICatalogType[]) => {
        return response;
      }));
  };

}
