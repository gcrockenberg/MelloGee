/**
 * This file contains authentication parameters. Contents of this file
 * is roughly the same across other MSAL.js libraries. These parameters
 * are used to initialize Angular and MSAL Angular configurations in
 * in app.module.ts file.
 */

import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

/**
 * Enter here the user flows and custom policies for your B2C application,
 * To learn more about user flows, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
    // Must choose ALL User flow or ALL Custom policy
    names: {
        signUpSignIn: 'B2C_1_susi_v2',       // User flow
        resetPassword: 'B2C_1_reset_v3',     // User flow
        editProfile: 'B2C_1_edit_profile_v2',   // User flow
        // signUpSignIn: 'B2C_1A_SIGNUP_SIGNIN',   // Custom policy
        // resetPassword: 'B2C_1A_SIGNUP_SIGNIN',  // Custom policy
        // editProfile: 'B2C_1A_PROFILEEDIT',    // Custom policy
    },
    authorities: {
        signUpSignIn: {
            authority: 'https://meauth.b2clogin.com/meauth.onmicrosoft.com/b2c_1_susi_v2',
            // authority: 'https://meauth.b2clogin.com/meauth.onmicrosoft.com/B2C_1A_SIGNUP_SIGNIN',
        },
        resetPassword: {
            authority: 'https://meauth.b2clogin.com/meauth.onmicrosoft.com/B2C_1_reset_v3',
            // authority: 'https://meauth.b2clogin.com/meauth.onmicrosoft.com/B2C_1A_PASSWORDRESET',
        },
        editProfile: {
            authority: 'https://meauth.b2clogin.com/meauth.onmicrosoft.com/b2c_1_edit_profile_v2',
            // authority: 'https://meauth.b2clogin.com/meauth.onmicrosoft.com/B2C_1A_PROFILEEDIT',
        },
    },
    authorityDomain: 'meauth.b2clogin.com',
};

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
    auth: {
        clientId: '69df1409-2d56-4f34-b5d9-598f44dfe22a', // This is the ONLY mandatory field that you need to supply.
        authority: b2cPolicies.authorities.signUpSignIn.authority, // Defaults to "https://login.microsoftonline.com/common"
        knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
        redirectUri: 'https://stmedev.z13.web.core.windows.net/auth', // Points to window.location.origin by default. You must register this URI on Azure portal/App Registration.
        postLogoutRedirectUri: 'https://stmedev.z13.web.core.windows.net/', // Points to window.location.origin by default.
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: isIE, // Set this to "true" if you are having issues on IE11 or Edge. Remove this line to use Angular Universal
    },
    system: {
        /**
         * Below you can configure MSAL.js logs. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/msal-logging-js
         */
        loggerOptions: {
            loggerCallback(logLevel: LogLevel, message: string) {
                console.log(message);
            },
            logLevel: LogLevel.Error,
            piiLoggingEnabled: false
        }
    }
}

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: ['openid']
}

/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "loginHint" property (such as a username). For more, visit:
 * https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-js-sso#sso-between-different-apps
 * If you do not receive the username claim in ID tokens, see also:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/FAQ.md#why-is-getaccountbyusername-returning-null-even-though-im-signed-in
 */
export const silentRequest = {
    scopes: [],
    loginHint: "example@domain.net"
};
