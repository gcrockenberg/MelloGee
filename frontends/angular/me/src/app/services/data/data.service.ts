import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SecurityService } from '../security/security.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private _http: HttpClient
  ) { }

  get(url: string, params?: any): Observable<Response> {
    let options = {};
    //this.setHeaders(options);

    return this._http.get<Response>(url, options)
      .pipe(
        // retry(3), // retry a failed request up to 3 times
        tap((response: Response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }


  private handleError(error: any) {
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


  // private setHeaders(options: any, needId?: boolean) {
  //   if (needId && this.securityService) {
  //     options["headers"] = new HttpHeaders()
  //       .append('authorization', 'Bearer ' + this.securityService.GetToken())
  //       .append('x-requestid', Guid.newGuid());
  //   }
  //   else if (this.securityService) {
  //     options["headers"] = new HttpHeaders()
  //       .append('authorization', 'Bearer ' + this.securityService.GetToken());
  //   }
  // }


}
