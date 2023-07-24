import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap } from 'rxjs';

import { StorageService } from '../storage/storage.service';
import { Constants, IConfiguration } from 'src/app/models/configuration/configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  serverSettings!: IConfiguration;

  // observable that is fired when settings are loaded from server
  private _settingsLoadedSource = new Subject<any>();
  settingsLoaded$ = this._settingsLoadedSource.asObservable();
  isReady: boolean = false;

  constructor(private _http: HttpClient, private _storageService: StorageService) {
    this._load();
  }

  private _load() {
    const baseURI = document.baseURI.endsWith('/') ? document.baseURI : `${document.baseURI}/`;
    let url = `${baseURI}config.me.json`;

    return this._http.get<IConfiguration>(url)
      .subscribe({
        next: (response: IConfiguration) => {
          this.serverSettings = response;
          this._storageService.store(Constants.IDENTITY_URL, this.serverSettings.identityUrl);
          this._storageService.store(Constants.PURCHASE_URL, this.serverSettings.purchaseUrl);
          this._storageService.store(Constants.SIGNAL_R_HUB_URL, this.serverSettings.signalrHubUrl);
          this._storageService.store(Constants.ACTIVATE_CAMPAIGN_DETAIL_FUNCTION, this.serverSettings.activateCampaignDetailFunction);
          
          this.isReady = true;
          this._settingsLoadedSource.next(response);
        },
        error: (error) => {
          this._handleError('load');
        }
      });
  }

  
  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   *
   * @param operation - name of the operation that failed
   */
  private _handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error);  // log to console instead

      // If a native error is caught, do not transform it. We only want to
      // transform response errors that are not wrapped in an `Error`.
      if (error.error instanceof Event) {
        throw error.error;
      }

      const message = `--> server returned code ${error.status} with body "${error.error}"`;
      // TODO: better job of transforming error for user consumption
      throw new Error(`${operation} failed: ${message}`);
    };
  }

}