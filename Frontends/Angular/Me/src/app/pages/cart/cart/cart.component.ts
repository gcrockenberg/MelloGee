import { Component, computed, WritableSignal, signal, Signal, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { CartService } from 'src/app/services/cart/cart.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnDestroy {
  private _subscriptions: Subscription[] = [];
  private _updateCartSubject: Subject<ICart> = new Subject<ICart>();

  readonly cart: WritableSignal<ICart> = signal({
    buyerId: '',
    items: []
  });

  readonly subTotal: Signal<number> = computed(() => {
    let totalPrice = 0;
    this.cart().items.forEach(item => {
      totalPrice += (item.unitPrice * item.quantity);
    });

    return totalPrice;
  });

  readonly tax: Signal<number> = computed(() => this.subTotal() * .06);
  readonly shipping = this._randomIntFromInterval(3, 10);
  readonly totalPrice: Signal<number> = computed(() => this.subTotal() + this.tax() + this.shipping);


  constructor(private _cartService: CartService, private _configurationService: ConfigurationService) {
    this.cart.set(_cartService.cart);

    this._subscriptions.push(
      this._cartService.cartUpdate$
        .subscribe((cart) => {
          console.log('--> Received updated cart from CartService')
          this.cart.set(cart);
        })
    );

    this._subscriptions.push(
      this._updateCartSubject.asObservable()
        .pipe(debounceTime(1000))
        .subscribe((cart: ICart) => {
          console.log('--> Updating CartService');
          this._cartService.setCart(this.cart()).subscribe();
        })
    );
  }


  changeQuantity(e: any, i: number) {
    let newQuantity = e.target.value;
    if (newQuantity) {
      this.cart.mutate(c => c.items[i].quantity = newQuantity);
      this._updateCartSubject.next(this.cart());
    }
  }


  private _randomIntFromInterval(min: number, max: number) {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    this._subscriptions.forEach(s => s.unsubscribe());
  }


}
