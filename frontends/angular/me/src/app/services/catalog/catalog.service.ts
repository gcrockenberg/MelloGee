import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration/configuration.service';
import { DataService } from '../data/data.service';
import { Observable, tap } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';

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


  getCatalog(pageIndex: number, pageSize: number, brand: number, type: number): Observable<ICatalog> {
    let url = this.catalogUrl;

    if (type) {
      url = this.catalogUrl + '/type/' + type.toString() + '/brand/' + ((brand) ? brand.toString() : '');
    }
    else if (brand) {
      url = this.catalogUrl + '/type/all' + '/brand/' + ((brand) ? brand.toString() : '');
    }

    url = url + '?pageIndex=' + pageIndex + '&pageSize=' + pageSize;

    return this._dataService.get(url).pipe<ICatalog>(tap((response: any) => {
      return response;
    }));
  }



}
