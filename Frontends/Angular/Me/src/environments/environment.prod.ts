import { InteractionType } from "@azure/msal-browser";
import { IEnvironment, AuthRequestType } from "./interfaces/IEnvironment";


export const environment: IEnvironment = {
  production: true,
  apiConfig: {
    scopes: ['https://fabrikamb2c.onmicrosoft.com/helloapi/demo.read'],
    uri: 'https://fabrikamb2chello.azurewebsites.net/hello',
  },
  b2cPolicies: {
    names: {
      signUpSignIn: 'B2C_1_susi_v2',
      resetPassword: 'B2C_1_reset_v3',
      editProfile: 'B2C_1_edit_profile_v2',
    },
    authorities: {
      signUpSignIn: {
        authority:
          'https://meauth.b2clogin.com/meauth.onmicrosoft.com/b2c_1_susi_v2',
      },
      resetPassword: {
        authority:
          'https://meauth.b2clogin.com/meauth.onmicrosoft.com/B2C_1_reset_v3',
      },
      editProfile: {
        authority:
          'https://meauth.b2clogin.com/meauth.onmicrosoft.com/b2c_1_edit_profile_v2',
      },
    },
    authorityDomain: 'meauth.b2clogin.com',
  },
  msalGuardConfig: {
    // Popup detects when user cancels the flow, Redirect does not which leaves inconsistent state.
    interactionType: InteractionType.Popup,
    authRequest: AuthRequestType.LoginRequest,
  }
};