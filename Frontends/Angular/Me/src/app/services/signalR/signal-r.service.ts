import { DestroyRef, Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { SecurityService } from '../security/security.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { ISignalREvent } from 'src/app/models/signal-r.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private readonly _destroying$ = new Subject<void>();
  private _destroyRef = inject(DestroyRef);
  private _hubConnection: HubConnection = <HubConnection>{};
  private _signalRHubUrl: string = '';
  private signalRSource = new Subject<ISignalREvent>();
  messageReceived$ = this.signalRSource.asObservable();

  constructor(
    private _securityService: SecurityService,
    private _configurationService: ConfigurationService
  ) {
    this._destroyRef.onDestroy(() => this._OnDestroy());

    this._securityService.isAuthorizedUpdate$
      .pipe(
        takeUntil(this._destroying$)
      ).subscribe((isAuthorized: boolean) => {

        _configurationService.whenReady
          .subscribe(() => {
            this._signalRHubUrl = this._configurationService.serverSettings.signalRHubUrl;
            if (isAuthorized) {
              this.init();;
            } else {
              this.stop();
            }
          });

        //this.transmitFakeMessages();
      })
  }


  private transmitFakeMessages(index: number = 1) {
    setTimeout(() => {
      this.signalRSource.next({
        orderId: 0,
        message: `FAKE MESSAGE ${index}`,
        status: 'fake'
      });
      this.transmitFakeMessages(++index);
    }, 10000)
  }


  private stop() {
    this._hubConnection.stop();
  }


  private init() {
    this.register();
    this.establishConnection();
    this.registerHandlers();
  }


  private register() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(this._signalRHubUrl + '/hub/notificationhub', <IHttpConnectionOptions>{
        accessTokenFactory: async () => {
          let token = await this._securityService.getToken();
          return token.accessToken;
        },
        logger: LogLevel.Warning,
        logMessageContent: true
      })
      .withAutomaticReconnect()
      .build();
  }


  private establishConnection() {
    this._hubConnection.start()
      .then(() => {
        console.log('Hub connection started')
      })
      .catch(() => {
        console.log('Error while establishing connection')
      });
  }


  private registerHandlers() {
    this._hubConnection.on('UpdatedOrderState', (msg) => {
      let message = (1 > msg.orderId) ? 'SignalR connected...' : `Order ${msg.orderId}: ${msg.status}`;
      console.log('--> SignalR: ', msg);
      this.signalRSource.next(
        {
          orderId: msg.orderId,
          message: message,
          status: msg.status
        }
      );
    });
  }


  private _OnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }


}
