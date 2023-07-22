import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { SecurityService } from '../security/security.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cartUrl: string = '';
  private _purchaseUrl: string = '';
  // cart: ICart = {
  //   buyerId: '',
  //   items: []
  // };


  constructor(
    private _dataService: DataService,
    private _securityService: SecurityService,
    private _configurationService: ConfigurationService,
    private _msalInstance: MsalService
  ) {
    //    this.cart.items = [];

    // Init:
    //    if (this._securityService.IsAuthorized) {
    //      if (this._securityService.UserData) {
    //        this.cart.buyerId = this._securityService.UserData.localAccountId;

    // By default, SessionID values are stored a cookie.
    // Use that to manage Cart
    // For login demo, use UserData.sub at the time of puchase
    if (this._configurationService.isReady) {
      this._cartUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
      this._purchaseUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
      // this._loadData();
    }
    else {
      this._configurationService.settingsLoaded$.subscribe(x => {
        this._cartUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
        this._purchaseUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
        // this._loadData();
      });
      //        }
      //      }
    }

    // this.cartWrapperService.orderCreated$.subscribe(x => {
    //     this.dropCart();
    // });
  }


  getCart(): Observable<ICart> {
    let url: string = this._cartUrl + 'foo';
    console.log(`cartComponent url: ${url}`);
    console.log(`cartComponent isAuthorized: ${this._securityService.IsAuthorized}`);
    console.log('local storage:', localStorage.getItem("token"));

    return this._dataService.get(url)
      .pipe<ICart>(tap((response: any) => {
        if (response.status === 204) {
          return null;
        }

        return response;
      }));
  }


  // private _loadData() {
  //   this.getCart().subscribe(cart => {
  //     if (cart != null)
  //       this.cart.items = cart.items;
  //   });
  // }



}
