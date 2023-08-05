import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartSidebarComponent } from "./components/cart-sidebar/cart-sidebar.component";
import { AltFooterComponent } from "./shared/components/alt-footer/alt-footer.component";

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
        AltFooterComponent
    ]
})
export class AppComponent {
  title: string = 'me'; 

  constructor(private _router: Router) {

    // Report page navigations to Google analytics
    _router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-HVZMVYPD4C', { 'page_path': event.urlAfterRedirects });
      }      
    })    
  }
}
