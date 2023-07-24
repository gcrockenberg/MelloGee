import { Injectable, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, Subject, tap } from 'rxjs';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { Guid } from 'src/guid';
import { ICartItem } from 'src/app/models/cart/cart-item.model';
import { CookieService } from 'ngx-cookie-service';

/**
 * Cart API is bound by SessionId
 */
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

  // Observable fired when item is added or removed from cart
  private _cartUpdateSource = new Subject<ICart>();
  cartUpdate$ = this._cartUpdateSource.asObservable();

  
  constructor(
    private _dataService: DataService,
    private _configurationService: ConfigurationService
  ) {
    // Init:
    //    if (this._securityService.IsAuthorized) {
    //      if (this._securityService.UserData) {
    //        this.cart.buyerId = this._securityService.UserData.localAccountId;
    // Switched to SessionId for Cart 
    // TODO: Review cookie policy. Defaults to Lax. Should it be Strict?
    if (!this._cookieService.check('SessionId')) {
      this._cookieService.set(
        'SessionId',
        Guid.newGuid(),
        new Date().getDate() + 7
      );
    }

    if (this._configurationService.isReady) {
      this._cartUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
      this._purchaseUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
      this._getCart().subscribe();
    }
    else {
      this._configurationService.settingsLoaded$.subscribe(x => {
        this._cartUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
        this._purchaseUrl = this._configurationService.serverSettings.purchaseUrl + '/b/api/v1/cart/';
        this._getCart().subscribe();
      });
      //        }
      //      }
    }

    // this.cartWrapperService.orderCreated$.subscribe(x => {
    //     this.dropCart();
    // });
  }


  addItemToCart(item: ICatalogItem): Observable<ICart> {
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

    return this.setCart(this.cart);
  }


  private _getCart(): Observable<ICart> {
    let url: string = this._cartUrl + this._cookieService.get('SessionId');

    return this._dataService.get<ICart>(url)
      .pipe<ICart>(
        tap((response: ICart) => {
          // if (response.status === 204) {
          //   return null;
          // }          
          this.cart = response;
          this._cartUpdateSource.next(this.cart); 

          return response;
        }));
  }


  setCart(cart: ICart): Observable<ICart> {
    cart.buyerId = this._cookieService.get('SessionId');

    return this._dataService.post<ICart>(this._cartUrl, cart).
      pipe<ICart>(
        tap((response: ICart) => {
          this.cart = response;
          this._cartUpdateSource.next(this.cart);
        })
      );
  }

}
