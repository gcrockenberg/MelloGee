import { Component, computed, WritableSignal, signal, Signal, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { CartService } from 'src/app/services/cart/cart.service';
import { ICart } from 'src/app/models/cart.model';
import { Subscription } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NgFor, RouterLink, RouterLinkActive],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  readonly cart: WritableSignal<ICart> = signal(<ICart>{});

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


  constructor(
    private _cartService: CartService) {

    this.cart.set(_cartService.cart);

    // Handle Cart being updated elsewhere
    this._subscriptions.push(
      this._cartService.cartUpdate$
        .subscribe((cart) => {
          this.cart.set(cart);
        })
    );

    // Throttle updates that this component makes to the Cart
    // this._subscriptions.push(
    //   this._updateCartSubject.asObservable()
    //     .pipe(debounceTime(1000))
    //     .subscribe((cart: ICart) => {
    //       this._cartService._setCart(this.cart()).subscribe();
    //     })
    // );
  }


  changeQuantity(event: any, itemIndex: number) {
    let newQuantity = event.target.value;
    if (newQuantity) {
      this._cartService.changeItemQuantity(itemIndex, newQuantity);
    }
  }


  removeItem(itemIndex: number) {
    this._cartService.removeItem(itemIndex);
  }


  private _randomIntFromInterval(min: number, max: number) {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }


}
