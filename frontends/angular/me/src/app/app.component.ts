import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";


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
    this.isIframe = window !== window.parent && !window.opener;
  }

}
