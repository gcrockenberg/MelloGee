import { ApplicationConfig, CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MsalModule,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { provideRouter, withDisabledInitialNavigation, withRouterConfig } from '@angular/router';
import { routes } from './config.routes';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MSALInstanceFactory } from './config.auth';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';


export const appConfig: ApplicationConfig = {
  providers: [
    Location,
    // { provide: LocationStrategy, useClass: HashLocationStrategy }, // Server routing support enabled
    importProvidersFrom(
      BrowserModule,
      //AppRoutingModule, // Use provideRoutes to enable tree shaking
      FormsModule,
      MsalModule
    ),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: () => { return environment.msalGuardConfig }
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    // If experimenting with new SSR in Angular Universal
    // Review initial navigation requirements for Msal + Universal
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/angular-universal.md
    provideRouter(routes,
      // withDisabledInitialNavigation()
        //InitialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' 
    ),  // imported in RouterModule
    provideHttpClient(withInterceptorsFromDi())
  ]
};
