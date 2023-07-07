import { ApplicationConfig, importProvidersFrom } from '@angular/core';
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
import { provideRouter } from '@angular/router';
import { routes } from './config.routes';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MSALInstanceFactory } from './config.auth';
import { environment } from 'src/environments/environment';


export const appConfig: ApplicationConfig = {
  providers: [
    Location,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    importProvidersFrom(
      BrowserModule,
//      AppRoutingModule, // This module breaks HashLocationStrategy which is needed for production deployment
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
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
