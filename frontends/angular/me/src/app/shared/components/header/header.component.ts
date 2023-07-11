import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, filter, takeUntil } from 'rxjs';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { SecurityService } from 'src/app/services/security/security.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();

  title: string = 'me';
  isIframe: boolean = false;
  isLogin: boolean = false;


  constructor(
    private _securityService: SecurityService,
    //private cd: ChangeDetectorRef,  // To manually control change detection
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
  ) { }


  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.setIsLogin();

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
          this.setIsLogin();
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setIsLogin();
      })
  }


  editProfile() {
    this._securityService.editProfile();
  }


  login(userFlowRequest?: RedirectRequest | PopupRequest) {
    console.log('redirectUri: ', window.location.origin);
    this._securityService.login(userFlowRequest);
  }


  logout() {
    this._securityService.logout();
  }


  setIsLogin() {
    this.isLogin = this._securityService.IsAuthorized;
  }


  // unsubscribe to events when component is destroyed
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

}
