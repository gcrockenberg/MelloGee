import { Injectable, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, Subject, switchMap, tap } from 'rxjs';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { Guid } from 'src/guid';
import { ICartItem } from 'src/app/models/cart/cart-item.model';
import { CookieService } from 'ngx-cookie-service';
import { IOrder } from 'src/app/models/order/order.model';
import { ICartCheckout } from 'src/app/models/cart/cart-checkout.model';

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
    sessionId: '',
    items: []
  };

  // Observable fired when item is added or removed from cart
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


  createCartCheckoutFromOrder(order: IOrder): ICartCheckout {
    let cartCheckout = <ICartCheckout>{};

    cartCheckout.cartsessionid = order.cartSessionId
    cartCheckout.street = order.street
    cartCheckout.city = order.city;
    cartCheckout.country = order.country;
    cartCheckout.state = order.state;
    cartCheckout.zipcode = order.zipcode;
    cartCheckout.cardexpiration = order.cardexpiration;
    cartCheckout.cardnumber = order.cardnumber;
    cartCheckout.cardsecuritynumber = order.cardsecuritynumber;
    cartCheckout.cardtypeid = order.cardtypeid;
    cartCheckout.cardholdername = order.cardholdername;

    return cartCheckout;
  }


  setCartCheckout(cartCheckout: ICartCheckout): Observable<boolean> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.setCartCheckout(cartCheckout)))
    }

    let url: string = this._cartUrl + 'checkout';

    return this._dataService.post(url, cartCheckout)
      .pipe<boolean>(
        tap((response: any) => {
          //this.basketWrapperService.orderCreated();
          return true;
        }));
  }


  private _getCart(): Observable<ICart> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this._getCart()))
    }

    let url: string = this._cartUrl + this._cookieService.get('SessionId');

    return this._dataService.get<ICart>(url)
      .pipe<ICart>(
        tap((response: ICart) => {
          // if (response.status === 204) {
          //   return null;
          // }          
          this.cart = response;
          console.log(response);
          this._cartUpdateSource.next(this.cart);

          return response;
        }));
  }


  setCart(cart: ICart): Observable<ICart> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.setCart(cart)))
    }

    cart.sessionId = this._cookieService.get('SessionId');

    return this._dataService.post<ICart>(this._cartUrl, cart).
      pipe<ICart>(
        tap((response: ICart) => {
          this.cart = response;
          this._cartUpdateSource.next(this.cart);
        })
      );
  }

}
