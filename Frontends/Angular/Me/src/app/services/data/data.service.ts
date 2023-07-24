import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
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


  private doPost<Type>(url: string, data: any, needId: boolean, params?: any): Observable<Type> {
    let options = {};
    this._setHeaders(options, needId);

    return this._http.post<Type>(url, data, options)
      .pipe(
        tap((response: Type) => {
          return response;
        }),
        catchError(this._handleError)
      );
  }


  get<Type>(url: string, params?: any): Observable<Type> {
    if (this._securityService.isSecurePath(url) && !this._securityService.IsAuthorized) {
      console.log('--> Msal fails to invoke interactive login when calling secure API unauthenticated');
      return of();
    }      

    let options = {};
    this._setHeaders(options);

    return this._http.get<Type>(url, options)
      .pipe(
        // retry(3), // retry a failed request up to 3 times
        tap((response: Type) => {
          return response;
        }),
        catchError(this._handleError)
      );
  }


  post<Type>(url: string, data: any, params?: any): Observable<Type> {
    let options = { };
    this._setHeaders(options);

    return this.doPost(url, data, false, params);
  }


  private _handleError(error: any) {
    console.log("Handle error: ", error);
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


  private async _setHeaders(options: any, needId?: boolean) {
  //  options["withCredentials"] = true;
  //   // if (needId && this.securityService) {
  //   //   options["headers"] = new HttpHeaders()
  //   //     .append('authorization', 'Bearer ' + this.securityService.GetToken())
  //   //     .append('x-requestid', Guid.newGuid());
  //   // }
  //   // else 

  //  = true and when I made the request I set withCredentials: true
  //   if (this._securityService.IsAuthorized) {
  //   options["headers"] = new HttpHeaders()
  //     .append('withCredentials', 'true');
  //       .append('authorization', 'Bearer ' + await this._securityService.getToken())
  //       .append('x-requestid', Guid.newGuid());
  //   }
  }


}
