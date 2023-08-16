import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/top/header/header.component";
import { NavbarComponent } from "./shared/components/top/navbar/navbar.component";
import { FooterComponent } from './shared/components/bottom/footer/footer.component';
import { CartSidebarComponent } from "./components/cart/cart-sidebar/cart-sidebar.component";
import { AltFooterComponent } from "./shared/components/bottom/alt-footer/alt-footer.component";
import { MsalService } from '@azure/msal-angular';
import { ToastComponent } from "./shared/components/tools/toast/toast.component";
import { environment } from 'src/environments/environment';

declare const gtag: Function;   // Google analytics

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
    AltFooterComponent,
    ToastComponent
  ]
})
export class AppComponent {
  title: string = 'me';

  constructor(
    private _router: Router,
    private _msalService: MsalService) {

    _msalService.instance.initialize();

    if (environment.production) {
      // Report page navigations to Google analytics
      _router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'G-HVZMVYPD4C', { 'page_path': event.urlAfterRedirects });
        }
      })
    }
  }
}
