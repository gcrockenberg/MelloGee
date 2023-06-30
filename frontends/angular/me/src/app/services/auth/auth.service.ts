import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import jwtDecode, { JwtPayload } from 'jwt-decode';

export const USER_STORAGE_KEY = 'APP_TOKEN';
export interface UserData {
  token: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Variables
  // Support async access to user auth data
  // Initial, undefined (aka unknown) state means we haven't determined if used is logged in yet. See loadUser() below.
  private _user: BehaviorSubject<UserData | null | undefined> =
    new BehaviorSubject<UserData | null | undefined>(undefined);

  // Properties
  public get CurrentUser(): Observable<UserData | null | undefined> {
    return this._user.asObservable();
  }
    
  
  constructor(private http: HttpClient) {
    // To avoid users having to login repeatedly, on page load see if they are already logged in
    this.tryLoadUser();
  }

  login(email: string, password: string) {
    return this.http.post('https://api.developbetterapps.com/auth', {
      email,
      password
    }).pipe(
      map((res: any) => {
        console.log('AUTH RESPONSE: ', res);
        // Console output shows token is in the response
        localStorage.setItem(USER_STORAGE_KEY, res.token)
        const decoded = jwtDecode<JwtPayload>(res.token);
        console.log('DECODED TOKEN: ', decoded);

        const userData: UserData = {
          token: res.token,
          id: decoded.sub!
        }

        this._user.next(userData);
      })
    );
  }

  register(email: string, password: string) {
    return this.http.post('https://api.developbetterapps.com/users', {
      email,
      password
    })
      .pipe(
        switchMap((res: any) => {
          return this.login(email, password)
        })
      );
  }

  signOut() {
    localStorage.removeItem(USER_STORAGE_KEY);
    this._user.next(null);
  }

  /**
   * Try to load user token from storage
   */
  tryLoadUser() {
    const token = localStorage.getItem(USER_STORAGE_KEY)

    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('TOKEN LOADED: ', decoded);

      const userData: UserData = {
        token: token,
        id: decoded.sub!
      }

      this._user.next(userData);
    } else {
      // Transition from undefined (aka unknown) state to null state. No login data exists.
      this._user.next(null);
    }
  }

}
