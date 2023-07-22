import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SecurityService } from '../security/security.service';
import { Guid } from 'src/guid';

/**
 * MsalInterceptor automatically acquires and adds access tokens headers for outgoing requests 
 * that use the Angular http client to known protected resources.
 * 
 * Angular Universal SSR does not support http calls from the server
 * If using SSR wrap http calls with 'if (typeof window !== "undefined") so they don't execute on the server
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private _http: HttpClient,
    private _securityService: SecurityService
  ) { }

  
  get<Type>(url: string, params?: any): Observable<Type> {
    // let options = {};
    // await this._setHeaders(options);

    return this._http.get<Type>(url)
      .pipe(
        // retry(3), // retry a failed request up to 3 times
        tap((response: Type) => {
          return response;
        }),
        catchError(this._handleError)
      );
  }


  private _handleError(error: any) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('Client side network error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error('Backend - ' +
        `status: ${error.status}, ` +
        `statusText: ${error.statusText}, ` +
        `message: ${error.error.message}`);
    }

    // return an observable with a user-facing error message
    return throwError(() => new Error(error || 'server error'));
  }


  // private async _setHeaders(options: any, needId?: boolean) {
  //   // if (needId && this.securityService) {
  //   //   options["headers"] = new HttpHeaders()
  //   //     .append('authorization', 'Bearer ' + this.securityService.GetToken())
  //   //     .append('x-requestid', Guid.newGuid());
  //   // }
  //   // else 
    
  //   if (this._securityService.IsAuthorized) {
  //     options["headers"] = new HttpHeaders()
  //       .append('authorization', 'Bearer ' + await this._securityService.getToken())
  //       .append('x-requestid', Guid.newGuid());
  //   }
  // }


}
