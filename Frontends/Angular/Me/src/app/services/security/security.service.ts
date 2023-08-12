import { Injectable, DestroyRef, inject } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { IdTokenClaimsWithPolicyId } from 'src/app/config.auth';
import { environment } from 'src/environments/environment';
import {
  AccountInfo,
  AuthenticationResult,
  EventMessage,
  EventType,
  IPublicClientApplication,
  InteractionStatus,
  InteractionType,
  PopupRequest,
  PromptValue,
  RedirectRequest,
  SsoSilentRequest
} from '@azure/msal-browser';
import { ClaimFields, UserData } from 'src/app/models/security/user-data.model';
import { OrderService } from '../order/order.service';


/**
 * TODO: Figure out how to configure msalAuth to ALWAYS ask which account to use. 
 * Do not default to the currently logged in user unless they ask to stay logged in.
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly _destroying$ = new Subject<void>();
  private _destroyRef = inject(DestroyRef);

  // Observable fired when isAuthorized changes
  private _isAuthorizedSource = new Subject<boolean>();
  isAutorizedUpdate$ = this._isAuthorizedSource.asObservable();

  public isAuthorized: boolean = false;
  public accountData?: AccountInfo;
  public userData: UserData = new UserData();

  private _msalInstance: IPublicClientApplication;

  constructor(
    private _msalService: MsalService,
    private _msalBroadcastService: MsalBroadcastService,
    private _orderService: OrderService
  ) {
    console.log('--> environment: ', environment);
    this._destroyRef.onDestroy(() => this._OnDestroy());
    this._msalInstance = _msalService.instance;
    this._initialize();
  }


  editProfile() {
    let editProfileFlowRequest: RedirectRequest | PopupRequest = {
      authority: environment.b2cPolicies.authorities.editProfile.authority,
      scopes: [],
    };

    this.login(editProfileFlowRequest);
  }


  async login(userFlowRequest?: RedirectRequest | PopupRequest) {
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/errors.md#interaction_in_progress
    await this._msalInstance.handleRedirectPromise();

    if (environment.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (environment.msalGuardConfig.authRequest) {
        this._msalService.loginPopup({ ...environment.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this._msalInstance.setActiveAccount(response.account);
          });
      } else {
        this._msalService.loginPopup(userFlowRequest)
          .subscribe((response: AuthenticationResult) => {
            this._msalInstance.setActiveAccount(response.account);
          });
      }
    } else {
      if (environment.msalGuardConfig.authRequest) {
        this._msalInstance.loginRedirect({ ...environment.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
      } else {
        this._msalInstance.loginRedirect(userFlowRequest);
      }
    }
  }


  logout() {
    if (environment.msalGuardConfig.interactionType === InteractionType.Popup) {
      this._msalService.logoutPopup({
        mainWindowRedirectUri: "/"
      });
    } else {
      this._msalService.logoutRedirect();
    }
  }


  private _checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this._msalInstance.getActiveAccount();

    if (!activeAccount && this._msalInstance.getAllAccounts().length > 0) {
      let accounts = this._msalInstance.getAllAccounts();
      // add your code for handling multiple accounts here
      this._msalInstance.setActiveAccount(accounts[0]);
    }
  }


  private _initialize(): void {
    this._setIsAuthorized();

    // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
    this._msalInstance.enableAccountStorageEvents();
    /**
     * You can subscribe to MSAL events as shown below. For more info,
     * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/events.md
     */
    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
        //tap((msg: EventMessage) => console.log('--> msalSubject$ event: ', msg))
      )
      .subscribe((result: EventMessage) => {
        if (this._msalInstance.getAllAccounts().length === 0) {
          window.location.pathname = "/";
        } else {
          this._setIsAuthorized();
        }
      });

    this._msalBroadcastService.inProgress$
      .pipe(
        //tap((status: InteractionStatus) => console.log('--> inProgress$ status: ', status)),
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        // She the order of the next 2 statements be switched?
        this._checkAndSetActiveAccount();
        this._setIsAuthorized();
      })

    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
          || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
          || msg.eventType === EventType.SSO_SILENT_SUCCESS),
        //tap((msg: EventMessage) => console.log('--> msalSubject$ event: ', msg)),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        let payload = result.payload as AuthenticationResult;
        let idtoken = payload.idTokenClaims as IdTokenClaimsWithPolicyId;

        if (idtoken.acr === environment.b2cPolicies.names.signUpSignIn || idtoken.tfp === environment.b2cPolicies.names.signUpSignIn) {
          this._msalInstance.setActiveAccount(payload.account);
        }

        /**
         * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
         * from SUSI flow. "acr" claim in the id token tells us the policy (NOTE: newer policies may use the "tfp" claim instead).
         * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
         */
        if (idtoken.acr === environment.b2cPolicies.names.editProfile || idtoken.tfp === environment.b2cPolicies.names.editProfile) {

          // retrieve the account from initial sing-in to the app
          const originalSignInAccount = this._msalInstance.getAllAccounts()
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
          this._msalService.ssoSilent(signUpSignInFlowRequest);
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
            scopes: [...environment.apiConfigs[0].scopes],
            prompt: PromptValue.LOGIN, // force user to reauthenticate with their new password
          };

          this.login(signUpSignInFlowRequest);
        }

        return result;
      });

    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
        //tap((msg: EventMessage) => console.log('--> msalSubject$ event: ', msg)),
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


  isSecurePath(url: string): boolean {
    let matchingSecurePath = environment.apiConfigs.find((config) => {
      let configUri = config.uri.replace('*', '');
      return url.startsWith(configUri);
    });

    if (!matchingSecurePath) {
      return false;
    }

    return true;
  }


  private async _setIsAuthorized() {
    // see https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
    await this._msalInstance.handleRedirectPromise();   // <-- Important

    let accountInfo: AccountInfo[] = this._msalInstance.getAllAccounts();
    let isAuthorized = accountInfo.length > 0;

    if (!isAuthorized) {
      this.accountData = <AccountInfo>{};
    } else {
      this.accountData = accountInfo[0];
      if (this.accountData.idTokenClaims) {
        //console.log(this.AccountData.idTokenClaims);
        this.userData.UserName = this.accountData.idTokenClaims[ClaimFields.USER_NAME] as string;
        this.userData.givenName = this.accountData.idTokenClaims[ClaimFields.GIVEN_NAME] as string;
        this.userData.surName = this.accountData.idTokenClaims[ClaimFields.SUR_NAME] as string;
        this.userData.streetAddress = this.accountData.idTokenClaims[ClaimFields.STREET_ADDRESS] as string;
        this.userData.city = this.accountData.idTokenClaims[ClaimFields.CITY] as string;
        this.userData.state = this.accountData.idTokenClaims[ClaimFields.STATE] as string;
        this.userData.postalCode = this.accountData.idTokenClaims[ClaimFields.POSTAL_CODE] as string;
        this.userData.country = this.accountData.idTokenClaims[ClaimFields.COUNTRY] as string;
        this.userData.Emails = this.accountData.idTokenClaims[ClaimFields.EMAILS] as string[];
      }
      //console.log(this.UserData);
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

    if (this.isAuthorized != isAuthorized) {
      this.isAuthorized = isAuthorized;
      this._isAuthorizedSource.next(this.isAuthorized);
    }
  }


  /**
   * This reduces poor experience from APIs scaled to 0 in demo environment
   * The non-secure APIs (Catalog and Cart) are awoken by components in the header and footer
   */
  private _wakeSecureApis() {
    this._orderService.getOrders().subscribe();
  }


  private _OnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }


}
