import { MsalGuardAuthRequest, MsalGuardConfiguration } from '@azure/msal-angular';
import { Configuration } from '@azure/msal-browser';

/**
   * Scopes you add here will be prompted for user consent during sign-in.
   * By default, MSAL.js will add OIDC scopes (openid, profile) to any login request.
   * For more information about OIDC scopes, visit:
   * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
   */
const LOGIN_REQUEST: MsalGuardAuthRequest = {
    scopes: ['openid'],
};
/**
   * An optional silentRequest object can be used to achieve silent SSO
   * between applications by providing a "loginHint" property (such as a username). For more, visit:
   * https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-js-sso#sso-between-different-apps
   * If you do not receive the username claim in ID tokens, see also:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/FAQ.md#why-is-getaccountbyusername-returning-null-even-though-im-signed-in
   */
const SILENT_REQUEST: MsalGuardAuthRequest = {
  scopes: [],
  loginHint: 'example@domain.net',
};
export const AuthRequestType = {
  LoginRequest: LOGIN_REQUEST,  
  SilentRequest: SILENT_REQUEST,
};


export interface IApiConfig {
  uri: string;
  scopes: string[];
}


export interface IEnvironment {
  production: boolean;
  apiConfigs: IApiConfig[];
  b2cPolicies: {
    names: {
      signUpSignIn: string;
      resetPassword: string;
      editProfile: string;
    };
    authorities: {
      signUpSignIn: {
        authority: string;
      };
      resetPassword: {
        authority: string;
      };
      editProfile: {
        authority: string;
      };
    };
    authorityDomain: string;
  };
  /**
   * Set your default interaction type for MSALGuard here. If you have any
   * additional scopes you want the user to consent upon login, add them here as well.
   */
  msalGuardConfig: MsalGuardConfiguration;
}
