import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration/configuration.service';
import { DataService } from '../data/data.service';
import { Observable, switchMap, tap } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { ICatalogBrand } from 'src/app/models/catalog/catalog-brand.model';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';

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
    private _dataService: DataService,
  ) {
    if (_configurationService.isReady) {
      this.catalogUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/items';
      this.brandUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/catalogbrands';
      this.typesUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/catalogtypes';
    } else {
      this._configurationService.settingsLoaded$.subscribe(x => {
        this.catalogUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/items';
        this.brandUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/catalogbrands';
        this.typesUrl = this._configurationService.serverSettings.purchaseUrl + '/c/api/v1/catalog/catalogtypes';
      });
    }
  }


  getCatalog(pageIndex: number, pageSize: number, brand?: number, type?: number): Observable<ICatalog> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getCatalog(pageIndex, pageSize, brand, type)))
    }

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


  getCatalogItem(itemId: number): Observable<ICatalogItem> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getCatalogItem(itemId)))
    }

    let url = this.catalogUrl + `/${itemId}`;

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

    return this._dataService.get<ICatalogBrand[]>(this.brandUrl)
      .pipe(tap((response: ICatalogBrand[]) => {
        return response;
      }));
  }


  getTypes(): Observable<ICatalogType[]> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.getTypes()))
    }

    return this._dataService.get<ICatalogType[]>(this.typesUrl)
      .pipe(tap((response: ICatalogType[]) => {
        return response;
      }));
  };

}
