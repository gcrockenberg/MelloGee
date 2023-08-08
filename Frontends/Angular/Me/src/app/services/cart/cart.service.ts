import { Injectable, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, Subject, map, switchMap, tap } from 'rxjs';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { Guid } from 'src/guid';
import { ICartItem } from 'src/app/models/cart/cart-item.model';
import { CookieService } from 'ngx-cookie-service';
import { IOrder } from 'src/app/models/order/order.model';
import { ICartCheckout } from 'src/app/models/cart/cart-checkout.model';
import { IStripeSuccessComponent, isStripeSuccessComponent } from 'src/app/models/order/stripe-success-route.model';
import { Router } from '@angular/router';
import { IStripeCancelComponent, isStripeCancelComponent } from 'src/app/models/order/stripe-cancel-route.model';

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
    private _configurationService: ConfigurationService,
    private _router: Router
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
      this._cartUrl = this._configurationService.serverSettings.cartUrl + '/b/api/v1/cart/';
      this._getCart();
    }
    else {
      this._configurationService.settingsLoaded$.subscribe(x => {
        this._cartUrl = this._configurationService.serverSettings.cartUrl + '/b/api/v1/cart/';
        this._getCart();
      });
    }

    // this.cartWrapperService.orderCreated$.subscribe(x => {
    //     this.dropCart();
    // });
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


  changeQuantity(cartItemIndex: number, newQuantity: number) {
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


  createCartCheckoutFromOrder(order: IOrder): ICartCheckout {
    let successRoute = this._router.config.find(
      (route) => isStripeSuccessComponent(route.component as unknown as IStripeSuccessComponent)
    );
    if (undefined == successRoute) {
      throw new Error("Stripe success route undefined.");
    }
    let cancelRoute = this._router.config.find(
      (route) => isStripeCancelComponent(route.component as unknown as IStripeCancelComponent)
    );
    if (undefined == cancelRoute) {
      throw new Error("Stripe cancel route undefined.");
    }

    let cartCheckout = <ICartCheckout>{};

    cartCheckout.cancelRoute = `/${cancelRoute.path}`;
    cartCheckout.successRoute = `/${successRoute.path}`;
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


  decreaseQuantity(cartItemIndex: number) {
    if (this.cart.items.length <= cartItemIndex || 0 > cartItemIndex) {
      throw new Error(`Invalid cart item index: ${cartItemIndex}`);
    }
    if (2 > this.cart.items[cartItemIndex].quantity) {
      return;
    }

    this.cart.items[cartItemIndex].quantity--;
    this._postCartAndBroadcast();
  }


  increaseQuantity(cartItemIndex: number) {
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
    this._postCartAndBroadcast;
  }


  setCartCheckout(cartCheckout: ICartCheckout): Observable<string> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.setCartCheckout(cartCheckout)))
    }

    let url: string = this._cartUrl + 'checkout';

    return this._dataService.post(url, cartCheckout)
      .pipe<string>(
        map((response: any) => {
          //this.basketWrapperService.orderCreated();
          return response.value as string;
        }));
  }


  private _getCart() {
    if (!this._configurationService.isReady) {
      this._configurationService.settingsLoaded$
        .subscribe(() => this._getCart())
    } else {
      let url: string = this._cartUrl + this._cookieService.get('SessionId');

      this._dataService.get<ICart>(url)
        .subscribe((response: ICart) => {
          // if (response.status === 204) {
          //   return null;
          // }          
          this.cart = response;
          this._cartUpdateSource.next(this.cart);
        });
    }
  }


  private _postCartAndBroadcast() {
    if (!this._configurationService.isReady) {
      this._configurationService.settingsLoaded$
        .subscribe(() => this._postCartAndBroadcast())
    } else {
      this.cart.sessionId = this._cookieService.get('SessionId');

      // Sever update no await
      // TODO: Should I debounce?
      this._dataService.post<ICart>(this._cartUrl, this.cart)
        .subscribe((response: ICart) => {
          this.cart = response;
        });

      // Notify listeners
      this._cartUpdateSource.next(this.cart);
    }
  }

}
