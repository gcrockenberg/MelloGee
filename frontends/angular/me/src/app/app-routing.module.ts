// import { NgModule } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { BrowserUtils } from '@azure/msal-browser';
// import { routes } from './app.routes';

/**
 * Using this breaks HashLocationStrategy which is needed for production deployment
 */
// @NgModule({
//     imports: [RouterModule.forRoot(routes, {
//         // Don't perform initial navigation in iframes or popups
//         initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Set to enabledBlocking to use Angular Universal
//     })],
//     exports: [RouterModule]
// })
// export class AppRoutingModule { }
