import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration/configuration.service';
import { DataService } from '../data/data.service';
import { Observable, switchMap, tap } from 'rxjs';
import { ICatalog, ICatalogBrand, ICatalogItem, ICatalogType } from 'src/app/models/catalog.model';

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

    _configurationService.whenReady
      .subscribe(() => {
        this._catalogUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'items';
        this._brandsUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'catalogbrands';
        this._typesUrl = this._configurationService.serverSettings.catalogUrl + urlPrefix + 'catalogtypes';
      });
  }


  /**
   * @param pageIndex 
   * @param pageSize 
   * @param typeId Start at 1
   * @param brandId Start at 1
   * @returns 
   */
  getCatalog(pageIndex: number, pageSize: number, typeId?: number, brandId?: number): Observable<ICatalog> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
        let url = this._catalogUrl;
        url = `${url}/type/${typeId ? typeId : -1}/brand/${brandId ? brandId : -1}`
        url = `${url}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this._dataService.get<ICatalog>(url)
          .pipe(tap((response: ICatalog) => {
            response.data.forEach(item => item.isNew = (Math.random() < 0.15));
            return response;
          }));
      }));
  }


  searchCatalog(pageIndex: number, pageSize: number, searchTerm: string): Observable<ICatalog> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
        let url = `${this._catalogUrl}/search/${searchTerm}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this._dataService.get<ICatalog>(url)
          .pipe(tap((response: ICatalog) => {
            response.data.forEach(item => item.isNew = (Math.random() < 0.15));
            return response;
          }));
      }));
  }


  getCatalogItem(itemId: number): Observable<ICatalogItem> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
        let url = this._catalogUrl + `/${itemId}`;

        return this._dataService.get<ICatalogItem>(url)
          .pipe(tap((response: ICatalogItem) => {
            return response;
          }));
      }));
  }


  getBrands(): Observable<ICatalogBrand[]> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
        return this._dataService.get<ICatalogBrand[]>(this._brandsUrl)
          .pipe(tap((response: ICatalogBrand[]) => {
            return response;
          }));
      }));
  }


  getTypes(): Observable<ICatalogType[]> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
        return this._dataService.get<ICatalogType[]>(this._typesUrl)
          .pipe(tap((response: ICatalogType[]) => {
            return response;
          }));
      }));
  }
  

}
