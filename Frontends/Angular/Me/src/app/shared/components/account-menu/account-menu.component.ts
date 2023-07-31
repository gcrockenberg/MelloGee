import { Component, Input, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, filter, takeUntil } from 'rxjs';
import { SecurityService } from 'src/app/services/security/security.service';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, PopupRequest, RedirectRequest } from '@azure/msal-browser';

@Component({
    selector: 'app-account-menu',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './account-menu.component.html',
    styleUrls: ['./account-menu.component.scss']
})
export class AccountMenuComponent {
    @Input() visible: boolean = false;


    constructor(private _securityService: SecurityService) { }


    editProfile() {
        this._securityService.editProfile();
    }


    logout() {
        this._securityService.logout();
    }

    
}
