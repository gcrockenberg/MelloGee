import { Component, HostListener, OnDestroy, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStatusComponent } from '../../../../components/cart/cart-status/cart-status.component';
import { NavbarItemComponent } from '../navbar-item/navbar-item.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBell, bootstrapCart3, bootstrapChevronDown, bootstrapJustify, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { MobileMenuComponent } from "../../menus/mobile-menu/mobile-menu.component";
import { AccountMenuComponent } from "../../menus/account-menu/account-menu.component";
import { Subscription } from 'rxjs';
import { SecurityService } from 'src/app/services/security/security.service';
import { SearchBarComponent } from "../../tools/search-bar/search-bar.component";
import { Router } from '@angular/router';
import { OrderService } from 'src/app/services/order/order.service';

const TOP_OFFSET: number = 66;

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    providers: [provideIcons({ bootstrapBell, bootstrapCart3, bootstrapChevronDown, bootstrapJustify, bootstrapSearch })],
    imports: [
        CartStatusComponent,
        CommonModule,
        NavbarItemComponent,
        NgIconComponent,
        MobileMenuComponent,
        AccountMenuComponent,
        SearchBarComponent
    ]
})
export class NavbarComponent implements OnDestroy {
    private _subscriptions: Subscription[] = [];

    readonly isAuthorized: WritableSignal<boolean> = signal(false);
    readonly showMobileMenu: WritableSignal<boolean> = signal(false);
    readonly showAccountMenu: WritableSignal<boolean> = signal(false);
    readonly showBackground: WritableSignal<boolean> = signal(false);
    readonly logoClicked: WritableSignal<boolean> = signal(false);

    constructor(
        private _securityService: SecurityService,
        private _router: Router,
        private _orderService: OrderService) {
        this.isAuthorized.set(_securityService.isAuthorized);
        // Handle authorization updates
        this._subscriptions.push(
            this._securityService.isAutorizedUpdate$
                .subscribe((newIsAuthorized: boolean) => {
                    this.isAuthorized.set(newIsAuthorized);
                    if (newIsAuthorized) {
                        this._wakeSecureApis();
                    }
                })
        );
    }


    editProfile() {
        this._securityService.editProfile();
    }


    login() {
        this._securityService.login();
    }


    logout() {
        this._securityService.logout();
    }


    handleLogoClicked() {
        this.logoClicked.set(true);
        this._router.navigate(['/']);
        setTimeout(() => {
            this.logoClicked.set(false);
        }, 1000);
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
        this._subscriptions.forEach(s => s.unsubscribe());
    }


    /**
     * This reduces poor experience from APIs scaled to 0 in demo environment
     * The non-secure APIs (Catalog and Cart) are awoken by components in the header and footer
     */
    private _wakeSecureApis() {
        this._orderService.getOrders().subscribe();
    }

    
}
