import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartSidebarComponent } from "./components/cart-sidebar/cart-sidebar.component";
import { AltFooterComponent } from "./shared/components/alt-footer/alt-footer.component";
import { MsalRedirectComponent, MsalService } from '@azure/msal-angular';

/**
 * Root bootstrap component instead of module.
 * Extends MsalRedirectComponent to support dual boot requirement for Msal libraries
 * Without extending Redirect auth doesn't work, only Popup auth
 */
@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
  imports: [
        FooterComponent,
        NgIf,
        RouterOutlet,
        HeaderComponent,
        NavbarComponent,
        CartSidebarComponent,
        AltFooterComponent
    ]
})
export class AppComponent implements OnInit  { //} extends MsalRedirectComponent { // OnDestroy {
  title: string = 'me';

  constructor(private _authService: MsalService) { }

  ngOnInit(): void {
    this._authService.getLogger().verbose('MsalRedirectComponent activated');
    this._authService.handleRedirectObservable()
      .subscribe((e: any) => console.log('--> handleRedirectObservable: ', e));
  }     

}
