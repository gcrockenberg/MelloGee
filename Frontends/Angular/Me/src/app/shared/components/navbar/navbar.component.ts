import { Component, HostListener, OnDestroy, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStatusComponent } from '../cart-status/cart-status/cart-status.component';
import { NavbarItemComponent } from '../navbar-item/navbar-item.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBell, bootstrapCart3, bootstrapChevronDown, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { MobileMenuComponent } from "../mobile-menu/mobile-menu.component";
import { AccountMenuComponent } from "../account-menu/account-menu.component";
import { Subject, Subscription } from 'rxjs';
import { SecurityService } from 'src/app/services/security/security.service';

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
export class NavbarComponent implements OnDestroy {     
    private _subscriptions: Subscription[] = [];

    private readonly _destroying$ = new Subject<void>();
    isIframe: boolean = false;

    isAuthorized: WritableSignal<boolean> = signal(false);
    showMobileMenu: WritableSignal<boolean> = signal(false);
    showAccountMenu: WritableSignal<boolean> = signal(false);
    showBackground: WritableSignal<boolean> = signal(false);

    constructor(
        private _securityService: SecurityService
    ) {
        this.isAuthorized.set(_securityService.isAuthorized);
        // Handle authorization updates
        this._subscriptions.push(
            this._securityService.isAutorizedUpdate$
                .subscribe((newIsAuthorized: boolean) => {
                    this.isAuthorized.set(newIsAuthorized);
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


    setIsAuthorized() {
        this.isAuthorized.set(this._securityService.isAuthorized);
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


    // unsubscribe to events when component is destroyed
    ngOnDestroy(): void {
        this._subscriptions.forEach(s => s.unsubscribe());
    }


}
