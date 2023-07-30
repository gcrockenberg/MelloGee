/**
 * This file contains authentication parameters. Contents of this file
 * is roughly the same across other MSAL.js libraries. These parameters
 * are used to initialize Angular and MSAL Angular configurations in
 * in app.module.ts file.
 */
import { MsalInterceptorConfiguration } from '@azure/msal-angular';
import { LogLevel, BrowserCacheLocation, IPublicClientApplication, PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { IdTokenClaims } from '@azure/msal-common';
import { environment } from 'src/environments/environment';
import { IApiConfig } from 'src/environments/interfaces/IEnvironment';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export type IdTokenClaimsWithPolicyId = IdTokenClaims & {
    acr?: string,
    tfp?: string,
};

/**
 * Here we pass the configuration parameters to create an MSAL instance.
 * For more info, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md
 */
export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication(
        {
            auth: {
                clientId: '69df1409-2d56-4f34-b5d9-598f44dfe22a', // This is the ONLY mandatory field that you need to supply.
                authority: environment.b2cPolicies.authorities.signUpSignIn.authority, // Defaults to "https://login.microsoftonline.com/common"
                knownAuthorities: [environment.b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
                redirectUri: '/auth', // Points to window.location.origin by default. You must register this URI on Azure portal/App Registration.
                postLogoutRedirectUri: '/', // Points to window.location.origin by default.
            },
            cache: {
                cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
                storeAuthStateInCookie: isIE, // Set this to "true" if you are having issues on IE11 or Edge. Remove this line to use Angular Universal
            },
            system: {
                // The allowNativeBroker flag is now turned on by default in the configurations. 
                // If you're using a B2C authority you can turn it off 
                allowNativeBroker: false,
                /**
                 * Below you can configure MSAL.js logs. For more information, visit:
                 * https://docs.microsoft.com/azure/active-directory/develop/msal-logging-js
                 */
                loggerOptions: {
                    loggerCallback(logLevel: LogLevel, message: string) {
                        console.log(message);
                    },
                    logLevel: LogLevel.Trace,
                    piiLoggingEnabled: false
                }
            }
        }
    );
}


export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string> | null>();
  
    environment.apiConfigs.forEach((apiConfig: IApiConfig) => {
        protectedResourceMap.set(apiConfig.uri, apiConfig.scopes);
    });    
    
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap
    };
}

