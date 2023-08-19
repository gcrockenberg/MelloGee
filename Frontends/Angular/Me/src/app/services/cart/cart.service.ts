import { Injectable, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { ICart, ICartCheckout, ICartItem } from 'src/app/models/cart.model';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, Subject, map, switchMap, tap } from 'rxjs';
import { Guid } from 'src/guid';
import { CookieService } from 'ngx-cookie-service';
import { ICatalogItem } from 'src/app/models/catalog.model';

/**
 * Cart API is bound by SessionId
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cartUrl: string = '';
  private _cookieService = inject(CookieService);
  cart: ICart = {
    sessionId: '',
    items: []
  };

  // Observable fired when Cart mutates
  private _cartUpdateSource = new Subject<ICart>();
  cartUpdate$ = this._cartUpdateSource.asObservable();


  constructor(
    private _dataService: DataService,
    private _configurationService: ConfigurationService
  ) {
    // TODO: Review cookie policy. Defaults to Lax. Should it be Strict?
    if (!this._cookieService.check('SessionId')) {
      this._cookieService.set(
        'SessionId',
        Guid.newGuid(),
        new Date().getDate() + 7
      );
    }

    _configurationService.whenReady.subscribe(() => {
      this._cartUrl = this._configurationService.serverSettings.cartUrl + '/b/api/v1/cart/';
      this.getCart();
    });
  }


  addCatalogItemToCart(item: ICatalogItem) {
    let cartItem = this.cart.items.find(value => value.productId == item.id);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      let newCartItem: ICartItem = {
        pictureUrl: item.pictureUri,
        productId: item.id,
        productName: item.name,
        quantity: 1,
        unitPrice: item.price,
        id: Guid.newGuid(),
        oldUnitPrice: 0
      };

      this.cart.items.push(newCartItem);
    }

    this._postCartAndBroadcast();
  }


  changeItemQuantity(cartItemIndex: number, newQuantity: number) {
    if (1 > newQuantity) {
      throw new Error(`Invalid cart item quantity: ${newQuantity}`);
    }
    if (this.cart.items.length <= cartItemIndex || 0 > cartItemIndex) {
      throw new Error(`Invalid cart item index: ${cartItemIndex}`);
    }
    if (this.cart.items[cartItemIndex].quantity == newQuantity) {
      return;
    }

    this.cart.items[cartItemIndex].quantity = newQuantity
    this._postCartAndBroadcast();
  }


  clearCart() {
    if (1 > this.cart.items.length) {
      return;
    }

    this.cart.items = [];
    this._postCartAndBroadcast();
  }


  decreaseItemQuantity(cartItemIndex: number) {
    if (this.cart.items.length <= cartItemIndex || 0 > cartItemIndex) {
      throw new Error(`Invalid cart item index: ${cartItemIndex}`);
    }
    if (2 > this.cart.items[cartItemIndex].quantity) {
      return;
    }

    this.cart.items[cartItemIndex].quantity--;
    this._postCartAndBroadcast();
  }


  increaseItemQuantity(cartItemIndex: number) {
    if (this.cart.items.length <= cartItemIndex || 0 > cartItemIndex) {
      throw new Error(`Invalid cart item index: ${cartItemIndex}`);
    }

    this.cart.items[cartItemIndex].quantity++;
    this._postCartAndBroadcast();
  }


  removeItem(cartItemIndex: number) {
    if (this.cart.items.length <= cartItemIndex || 0 > cartItemIndex) {
      throw new Error(`Invalid cart item index: ${cartItemIndex}`);
    }

    this.cart.items.splice(cartItemIndex, 1);
    this._postCartAndBroadcast();
  }


  setCartCheckout(cartCheckout: ICartCheckout): Observable<string> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
        let url: string = this._cartUrl + 'checkout';

        return this._dataService.post(url, cartCheckout)
          .pipe<string>(
            map((response: any) => {
              //this.basketWrapperService.orderCreated();
              return response.value as string;
            }));
      }));
  }


  /**
   * Pull cart from server
   * @returns 
   */
  getCart() {
    return this._configurationService.whenReady.subscribe(x => {
      let url: string = this._cartUrl + this._cookieService.get('SessionId');

      this._dataService.get<ICart>(url)
        .subscribe((response: ICart) => {
          // if (response.status === 204) {
          //   return null;
          // }          
          this.cart = response;
          this._cartUpdateSource.next(this.cart);
        });
    });
  }


  private _postCartAndBroadcast() {
    this._configurationService.whenReady.subscribe(() => {
      this.cart.sessionId = this._cookieService.get('SessionId');

      // Sever update no await
      // TODO: Should I debounce?
      this._dataService.post<ICart>(this._cartUrl, this.cart)
        .subscribe((response: ICart) => {
          this.cart = response;
          this._cartUpdateSource.next(this.cart);
        });

      // Notify listeners
      this._cartUpdateSource.next(this.cart);
    });
  }

}
