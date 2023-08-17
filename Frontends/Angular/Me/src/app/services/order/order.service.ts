import { Injectable } from '@angular/core';
import { IOrderDetails, IOrderSummary, ICheckoutResponse, IPayOrder, IPayOrderRequest } from 'src/app/models/order/order.model';
import { CartService } from '../cart/cart.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { Observable, of, switchMap, tap } from 'rxjs';
import { DataService } from '../data/data.service';
import { ICartCheckout } from 'src/app/models/cart/cart-checkout.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private _ordersUrl: string = '';

  constructor(
    private _cartService: CartService,
    private _configurationService: ConfigurationService,
    private _dataService: DataService) {

      _configurationService.whenReady
        .subscribe(() => this._ordersUrl = this._configurationService.serverSettings.orderUrl + '/o/api/v1/orders/')
  }


  getOrders(): Observable<IOrderSummary[]> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
          let url = this._ordersUrl;

          return this._dataService.get(url)
            .pipe<IOrderSummary[]>(
              tap((response: any) => {
                return (response) ? response : of([]);
              }));
        }));
  }


  getOrderStatus(orderId: number): Observable<IOrderDetails> {
    if (1 > orderId) return of(<IOrderDetails>{});

    return this._configurationService.whenReady
      .pipe(switchMap(x => {
          let url = `${this._ordersUrl}${orderId}`;

          return this._dataService.get(url)
            .pipe<IOrderDetails>(
              tap((response: any) => {
                return (response) ? response : of([]);
              }));
        }));
  }


  getPayOrder(orderCheckout: IPayOrderRequest): Observable<IPayOrder> {
    if (1 > orderCheckout.orderId) return of(<IPayOrder>{});

    return this._configurationService.whenReady
      .pipe(switchMap(x => {
          let url = `${this._ordersUrl}pay`;

          return this._dataService.post<IPayOrder>(url, orderCheckout)
            .pipe<IPayOrder>(
              tap((response: IPayOrder) => {
                return (response) ? response : of([]);
              }));
        }));
  }


  setCartCheckout(cartCheckout: ICartCheckout): Observable<ICheckoutResponse> {
    return this._configurationService.whenReady
      .pipe(switchMap(x => {
          let url: string = this._ordersUrl + 'checkout';

          return this._dataService.post<ICheckoutResponse>(url, cartCheckout)
            .pipe(
              tap((response: ICheckoutResponse) => {
                // Cleared on the server upon success. Clearing here reinforces user experience.
                this._cartService.clearCart();                
              }));
        }));
  }


}
