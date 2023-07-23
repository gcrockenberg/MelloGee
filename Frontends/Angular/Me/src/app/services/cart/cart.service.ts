import { Injectable, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { SecurityService } from '../security/security.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MsalService } from '@azure/msal-angular';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { Guid } from 'src/guid';
import { ICartItem } from 'src/app/models/cart/cart-item.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cartUrl: string = '';
  private _purchaseUrl: string = '';
  private _cookieService = inject(CookieService);
  cart: ICart = {
    buyerId: '',
    items: []
  };


  constructor(
    private _dataService: DataService,
    private _securityService: SecurityService,
    private _configurationService: ConfigurationService,
    private _msalInstance: MsalService
  ) {
    // Init:
    //    if (this._securityService.IsAuthorized) {
    //      if (this._securityService.UserData) {
    //        this.cart.buyerId = this._securityService.UserData.localAccountId;
    if (!this._cookieService.check('SessionId')) {
      this._cookieService.set(
        'SessionId',
        Guid.newGuid(),
        new Date().getDate() + 7
      );
    }

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


  addItemToCart(item: ICatalogItem): Observable<boolean> {
    let newCartItem: ICartItem = {
      pictureUrl: item.pictureUri,
      productId: item.id,
      productName: item.name,
      quantity: 1,
      unitPrice: item.price,
      id: Guid.newGuid(),
      oldUnitPrice: 0
    };
    let cartItem = this.cart.items.find(value => value.productId == newCartItem.productId);

    if (cartItem) {
      cartItem.quantity++;
    } else {
      this.cart.items.push(newCartItem);
    }

    return this._setCart();
  }


  getCart(): Observable<ICart> {
    let url: string = this._cartUrl + this._cookieService.get('SessionId');

    return this._dataService.get(url)
      .pipe<ICart>(
        tap((response: any) => {
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


  private _setCart(): Observable<boolean> {
    this.cart.buyerId = this._cookieService.get('SessionId');

    return this._dataService.post(this._cartUrl, this.cart).
      pipe<boolean>(tap((response: any) => true));
  }

}
