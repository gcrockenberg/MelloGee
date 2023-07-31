import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartSidebarComponent } from "./components/cart-sidebar/cart-sidebar.component";
import { AltFooterComponent } from "./shared/components/alt-footer/alt-footer.component";
import { MsalService } from '@azure/msal-angular';

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
export class AppComponent implements OnInit{
  title: string = 'me'; 

  constructor(private _msalService: MsalService) { }

  async ngOnInit(): Promise<void> {
    await this._msalService.instance.handleRedirectPromise();
  }

}
