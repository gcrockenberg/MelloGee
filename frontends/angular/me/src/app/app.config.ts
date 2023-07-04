import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MsalModule,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalGuardConfiguration
} from '@azure/msal-angular';
import { IPublicClientApplication, InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { loginRequest, msalConfig } from './auth-config';


/**
 * Here we pass the configuration parameters to create an MSAL instance.
 * For more info, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md
 */
function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}


/**
 * Set your default interaction type for MSALGuard here. If you have any
 * additional scopes you want the user to consent upon login, add them here as well.
 */
function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    // Popup detects when user cancels the flow, Redirect does not which leaves inconsistent state.
    interactionType: InteractionType.Popup,
    authRequest: loginRequest
  };
}


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      MsalModule
    ),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    provideHttpClient(withInterceptorsFromDi())
  ]
};
