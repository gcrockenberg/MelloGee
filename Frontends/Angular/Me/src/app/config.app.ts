import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MsalModule,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptor
} from '@azure/msal-angular';
import { provideRouter } from '@angular/router';
import { routes } from './config.routes';
import { MSALInstanceFactory, MSALInterceptorConfigFactory } from './config.auth';
import { environment } from 'src/environments/environment';


export const appConfig: ApplicationConfig = {
  providers: [
    Location,
    importProvidersFrom(
      BrowserModule,
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
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: HTTP_INTERCEPTORS, // Provides as HTTP Interceptor
      useClass: MsalInterceptor,
      multi: true
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
