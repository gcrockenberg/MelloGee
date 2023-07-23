import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { BrowserUtils } from '@azure/msal-browser';

/**
 * Root bootstrap component instead of module
 */
@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        NgIf,
        RouterOutlet,
        HeaderComponent,
        NavbarComponent
    ]
})
export class AppComponent implements OnInit { // OnDestroy {
  title: string = 'me';
  isIframe: boolean = false;


  constructor() { }


  ngOnInit(): void {
    // Angular Universal does not support browser global obects on the server
    if (typeof window !== "undefined") {  // Safety check
      this.isIframe = window !== window.parent && !window.opener; 
    }
  }

}
