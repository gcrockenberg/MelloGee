// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { InteractionType } from '@azure/msal-browser';
import { AuthRequestType, IEnvironment } from './interfaces/IEnvironment';


export const environment: IEnvironment = {
  production: false,
  apiConfigs: [{
    scopes: [],
    uri: '',
  }],
  b2cPolicies: {
    names: {
      signUpSignIn: '',
      resetPassword: '',
      editProfile: '',
    },
    authorities: {
      signUpSignIn: {
        authority: '',
      },
      resetPassword: {
        authority: '',
      },
      editProfile: {
        authority: '',
      },
    },
    authorityDomain: '',
  },
  /**
   * Set your default interaction type for MSALGuard here. If you have any
   * additional scopes you want the user to consent upon login, add them here as well.
   */
  msalGuardConfig: {
    // Popup detects when user cancels the flow, Redirect does not which leaves inconsistent state.
    interactionType: InteractionType.Redirect,
    authRequest: AuthRequestType.LoginRequest    // Scopes
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
