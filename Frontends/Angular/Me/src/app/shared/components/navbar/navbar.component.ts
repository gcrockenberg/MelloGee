import { Component, HostListener, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStatusComponent } from '../cart-status/cart-status/cart-status.component';
import { NavbarItemComponent } from '../navbar-item/navbar-item.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBell, bootstrapCart3, bootstrapChevronDown, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { MobileMenuComponent } from "../mobile-menu/mobile-menu.component";
import { AccountMenuComponent } from "../account-menu/account-menu.component";

const TOP_OFFSET: number = 66;

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    providers: [provideIcons({ bootstrapBell, bootstrapCart3, bootstrapChevronDown, bootstrapSearch })],
    imports: [
        CartStatusComponent,
        CommonModule,
        NavbarItemComponent,
        NgIconComponent,
        MobileMenuComponent,
        AccountMenuComponent
    ]
})
export class NavbarComponent implements OnDestroy, OnInit {
    showMobileMenu: WritableSignal<boolean> = signal(false);
    showAccountMenu: WritableSignal<boolean> = signal(false);
    showBackground: WritableSignal<boolean> = signal(false);

    constructor() { }

    ngOnInit(): void {
        //window.addEventListener('scroll', this.handleScroll);
    }


    @HostListener('window:scroll', [])
    handleScroll() {
        this.showBackground.set(window.scrollY > TOP_OFFSET);
    }


    setShowAccountMenu() {
        this.showAccountMenu.set(!this.showAccountMenu());
    }


    setShowMobileMenu() {
        this.showMobileMenu.set(!this.showMobileMenu());
    }


    ngOnDestroy(): void {
        //window.removeEventListener('scroll', this.handleScroll);
    }

}
