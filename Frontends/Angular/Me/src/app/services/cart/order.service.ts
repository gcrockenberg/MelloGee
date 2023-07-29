import { Injectable } from '@angular/core';
import { IOrderItem } from 'src/app/models/cart/order-item.model';
import { IOrder } from 'src/app/models/order/order.model';
import { CartService } from './cart.service';
import { SecurityService } from '../security/security.service';
import { UserData } from 'src/app/models/security/user-data.model';
import { ICart } from 'src/app/models/cart/cart.model';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, map, switchMap, tap } from 'rxjs';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private _orderUrl: string = '';

  constructor(
    private _cartService: CartService,
    private _securityService: SecurityService,
    private _configurationService: ConfigurationService,
    private _dataService: DataService) {

    if (this._configurationService.isReady) {
      this._orderUrl = this._configurationService.serverSettings.purchaseUrl + '/o/api/v1/order/';
    }
    else {
      this._configurationService.settingsLoaded$.subscribe(x => {
        this._orderUrl = this._configurationService.serverSettings.purchaseUrl + '/o/api/v1/order/';
      });
    }
  }


  createLinkToCheckout(): Observable<string> {
    if (!this._configurationService.isReady) {
      return this._configurationService.settingsLoaded$
        .pipe(switchMap(x => this.createLinkToCheckout()))
    }

    let url: string = this._orderUrl + 'create-checkout-session';

    return this._dataService.post(url, {})
      .pipe<string>(
        map((response: any) => {
          //this.basketWrapperService.orderCreated();
          return response.value as string;
        }));
  }


  createOrderFromCartAndIdentity(): IOrder {
    let order: IOrder = <IOrder>{};
    let cart: ICart = this._cartService.cart;
    let identityInfo: UserData = this._securityService.userData;

    console.log(cart);
    console.log(identityInfo);

    // Identity data mapping
    order.street = identityInfo.streetAddress;
    order.city = identityInfo.city;
    order.country = identityInfo.country;
    order.state = identityInfo.state;
    order.zipcode = identityInfo.postalCode;
    order.cardexpiration = new Date(Date.now());
    order.cardnumber = '';
    order.cardsecuritynumber = '';
    order.cardtypeid = 0;
    order.cardholdername = `${identityInfo.givenName} ${identityInfo.surName}`;
    order.total = 0;
    order.expiration = '';

    // Cart data mapping
    order.cartSessionId = cart.sessionId;
    order.orderItems = new Array<IOrderItem>();
    cart.items.forEach(x => {
      let item: IOrderItem = <IOrderItem>{};
      item.pictureurl = x.pictureUrl;
      item.productId = +x.productId;
      item.productname = x.productName;
      item.unitprice = x.unitPrice;
      item.units = x.quantity;

      order.total += (item.unitprice * item.units);

      order.orderItems.push(item);
    });

    // if (this._securityService.accountData) {
    //   order.buyer = this._securityService.accountData.localAccountId;
    // }

    return order;
  }

}
