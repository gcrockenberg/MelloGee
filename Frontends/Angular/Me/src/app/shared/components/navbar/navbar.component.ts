import { Component, HostListener, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStatusComponent } from '../cart-status/cart-status/cart-status.component';
import { NavbarItemComponent } from '../navbar-item/navbar-item.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBell, bootstrapCart3, bootstrapChevronDown, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { MobileMenuComponent } from "../mobile-menu/mobile-menu.component";
import { AccountMenuComponent } from "../account-menu/account-menu.component";
import { EventMessage, EventType, InteractionStatus, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { SecurityService } from 'src/app/services/security/security.service';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';

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
    private readonly _destroying$ = new Subject<void>();
    isIframe: boolean = false;

    isAuthorized: WritableSignal<boolean> = signal(true);
    showMobileMenu: WritableSignal<boolean> = signal(false);
    showAccountMenu: WritableSignal<boolean> = signal(false);
    showBackground: WritableSignal<boolean> = signal(false);

    constructor(
        private _securityService: SecurityService,
        //private cd: ChangeDetectorRef,  // To manually control change detection
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService,
    ) { }


    ngOnInit(): void {
        this.isIframe = window !== window.parent && !window.opener;
        this.setIsAuthorized();

        /**
         * You can subscribe to MSAL events as shown below. For more info,
         * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/events.md
         */
        this.msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {
                if (this.authService.instance.getAllAccounts().length === 0) {
                    window.location.pathname = "/";
                } else {
                    this.setIsAuthorized();
                }
            });

        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                this.setIsAuthorized();
            })
    }


    editProfile() {
        this._securityService.editProfile();
    }


    login(userFlowRequest?: RedirectRequest | PopupRequest) {
        this._securityService.login(userFlowRequest);
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
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }


}
