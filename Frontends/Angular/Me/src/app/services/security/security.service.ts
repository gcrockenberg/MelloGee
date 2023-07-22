import { Injectable, DestroyRef, inject } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, EventMessage, EventType, InteractionRequiredAuthError, InteractionStatus, InteractionType, PopupRequest, PromptValue, RedirectRequest, SsoSilentRequest } from '@azure/msal-browser';
import { Subject, catchError, filter, firstValueFrom, of, takeUntil, tap } from 'rxjs';
import { IdTokenClaimsWithPolicyId } from 'src/app/config.auth';
import { environment } from 'src/environments/environment';


/**
 * TODO: Configure msalAuth to ALWAYS ask which account to use. Do not default to the currently logged in user.
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly _destroying$ = new Subject<void>();
  private _destroyRef = inject(DestroyRef);

  public IsAuthorized: boolean = false;
  public UserData?: AccountInfo;

  constructor(
    private _msalInstance: MsalService,
    private _msalBroadcastService: MsalBroadcastService,
  ) {
    this._destroyRef.onDestroy(() => this._OnDestroy());
    this._initialize();
  }


  editProfile() {
    let editProfileFlowRequest: RedirectRequest | PopupRequest = {
      authority: environment.b2cPolicies.authorities.editProfile.authority,
      scopes: [],
    };

    this.login(editProfileFlowRequest);
  }


  login(userFlowRequest?: RedirectRequest | PopupRequest) {
    console.log('redirectUri: ', window.location.origin);
    if (environment.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (environment.msalGuardConfig.authRequest) {
        this._msalInstance.loginPopup({ ...environment.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this._msalInstance.instance.setActiveAccount(response.account);
          });
      } else {
        this._msalInstance.loginPopup(userFlowRequest)
          .subscribe((response: AuthenticationResult) => {
            this._msalInstance.instance.setActiveAccount(response.account);
          });
      }
    } else {
      if (environment.msalGuardConfig.authRequest) {
        console.log('authService.loginRedirect() params: ', { ...environment.msalGuardConfig.authRequest, ...userFlowRequest });
        this._msalInstance.instance.loginRedirect({ ...environment.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
      } else {
        this._msalInstance.instance.loginRedirect(userFlowRequest);
      }
    }
  }


  logout() {
    //this.authService.logout();
    if (environment.msalGuardConfig.interactionType === InteractionType.Popup) {
      this._msalInstance.logoutPopup({
        mainWindowRedirectUri: "/"
      });
    } else {
      this._msalInstance.logoutRedirect();
    }
  }


  private _checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this._msalInstance.instance.getActiveAccount();

    if (!activeAccount && this._msalInstance.instance.getAllAccounts().length > 0) {
      let accounts = this._msalInstance.instance.getAllAccounts();
      // add your code for handling multiple accounts here
      this._msalInstance.instance.setActiveAccount(accounts[0]);
    }
  }


  private _initialize(): void {
    this._setIsAuthorized();

    // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
    this._msalInstance.instance.enableAccountStorageEvents();
    /**
     * You can subscribe to MSAL events as shown below. For more info,
     * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/events.md
     */
    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
      )
      .subscribe((result: EventMessage) => {
        if (this._msalInstance.instance.getAllAccounts().length === 0) {
          window.location.pathname = "/";
        } else {
          this._setIsAuthorized();
        }
      });

    this._msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this._setIsAuthorized();
        this._checkAndSetActiveAccount();
      })

    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
          || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
          || msg.eventType === EventType.SSO_SILENT_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        let payload = result.payload as AuthenticationResult;
        let idtoken = payload.idTokenClaims as IdTokenClaimsWithPolicyId;

        if (idtoken.acr === environment.b2cPolicies.names.signUpSignIn || idtoken.tfp === environment.b2cPolicies.names.signUpSignIn) {
          this._msalInstance.instance.setActiveAccount(payload.account);
        }

        /**
         * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
         * from SUSI flow. "acr" claim in the id token tells us the policy (NOTE: newer policies may use the "tfp" claim instead).
         * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
         */
        if (idtoken.acr === environment.b2cPolicies.names.editProfile || idtoken.tfp === environment.b2cPolicies.names.editProfile) {

          // retrieve the account from initial sing-in to the app
          const originalSignInAccount = this._msalInstance.instance.getAllAccounts()
            .find((account: AccountInfo) =>
              account.idTokenClaims?.oid === idtoken.oid
              && account.idTokenClaims?.sub === idtoken.sub
              && ((account.idTokenClaims as IdTokenClaimsWithPolicyId).acr === environment.b2cPolicies.names.signUpSignIn
                || (account.idTokenClaims as IdTokenClaimsWithPolicyId).tfp === environment.b2cPolicies.names.signUpSignIn)
            );

          let signUpSignInFlowRequest: SsoSilentRequest = {
            authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
            account: originalSignInAccount
          };

          // silently login again with the signUpSignIn policy
          this._msalInstance.ssoSilent(signUpSignInFlowRequest);
        }

        /**
         * Below we are checking if the user is returning from the reset password flow.
         * If so, we will ask the user to reauthenticate with their new password.
         * If you do not want this behavior and prefer your users to stay signed in instead,
         * you can replace the code below with the same pattern used for handling the return from
         * profile edit flow (see above ln. 74-92).
         */
        if (idtoken.acr === environment.b2cPolicies.names.resetPassword || idtoken.tfp === environment.b2cPolicies.names.resetPassword) {
          let signUpSignInFlowRequest: RedirectRequest | PopupRequest = {
            authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
            prompt: PromptValue.LOGIN, // force user to reauthenticate with their new password
            scopes: []
          };

          this.login(signUpSignInFlowRequest);
        }

        return result;
      });

    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        // Checking for the forgot password error. Learn more about B2C error codes at
        // https://learn.microsoft.com/azure/active-directory-b2c/error-codes
        if (result.error && result.error.message.indexOf('AADB2C90118') > -1) {
          let resetPasswordFlowRequest: RedirectRequest | PopupRequest = {
            authority: environment.b2cPolicies.authorities.resetPassword.authority,
            scopes: [],
          };

          this.login(resetPasswordFlowRequest);
        };
      });
  }

  private _setIsAuthorized() {
    let accountInfo: AccountInfo[] = this._msalInstance.instance.getAllAccounts();
    this.IsAuthorized = accountInfo.length > 0;

    // see https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
    if (this.IsAuthorized) {
      this.UserData = accountInfo[0];
      // console.log(`homeAccountId: ${accountInfo[0].homeAccountId}`);
      // console.log(`environment: ${accountInfo[0].environment}`);
      // console.log(`tenantId: ${accountInfo[0].tenantId}`);
      // console.log(`username: ${accountInfo[0].username}`);
      // console.log(`localAccountId: ${accountInfo[0].localAccountId}`);
      // console.log(`name: ${accountInfo[0].name}`);
      // console.log(`idToken: ${accountInfo[0].idToken}`);
      // console.log(`nativeAccountId: ${accountInfo[0].nativeAccountId}`);
      // console.log('idTokenClaims: ', accountInfo[0].idTokenClaims);
    }
  }

/**
 * Rely on MsalInterceptor to automatically acquires tokens for outgoing requests 
 * that use the Angular http client to known protected resources.
 * 
 */
  // async getToken(): Promise<string> {
  //   const REQUEST = { scopes: ["https://meauth.onmicrosoft.com/cart/cart.read"] };
  //   const authenticationResult: AuthenticationResult = await firstValueFrom(
  //     this._msalInstance.acquireTokenSilent(REQUEST)
  //       .pipe(
  //         // retry(3), // retry a failed request up to 3 times
  //         tap((response: AuthenticationResult) => {
  //           return response.accessToken;
  //         })
  //       )
  //   );
    
  //   return authenticationResult.accessToken;
  // }


  // unsubscribe to events when component is destroyed
  private _OnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
