import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarItemComponent } from "../navbar-item/navbar-item.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBell, bootstrapChevronDown, bootstrapSearch } from "@ng-icons/bootstrap-icons"
import { MobileMenuComponent } from "../mobile-menu/mobile-menu.component";
import { AccountMenuComponent } from "../account-menu/account-menu.component";

const TOP_OFFSET: number = 66;

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    providers: [provideIcons({ bootstrapBell, bootstrapChevronDown, bootstrapSearch })],
    imports: [
        CommonModule,
        NavbarItemComponent,
        NgIconComponent,
        MobileMenuComponent,
        AccountMenuComponent
    ]
})
export class NavbarComponent implements OnDestroy, OnInit {
    showMobileMenu: boolean = false;
    showAccountMenu: boolean = false;
    showBackground: boolean = false;

    constructor() { }

    ngOnInit(): void {
        //window.addEventListener('scroll', this.handleScroll);
    }


    @HostListener('window:scroll', [])
    handleScroll() {
        this.showBackground = (window.scrollY > TOP_OFFSET);
    }


    setShowAccountMenu() {
        this.showAccountMenu = !this.showAccountMenu;
    }


    setShowMobileMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }


    ngOnDestroy(): void {
        //window.removeEventListener('scroll', this.handleScroll);
    }

}
