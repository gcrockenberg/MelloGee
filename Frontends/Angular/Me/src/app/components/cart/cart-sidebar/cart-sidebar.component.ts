import { Component, OnDestroy, Signal, WritableSignal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapChevronRight, bootstrapTrash3, bootstrapXLg, bootstrapCart3 } from "@ng-icons/bootstrap-icons";
import { ISidebar } from 'src/app/models/sidebar/sidebar.model';
import { SidebarService } from 'src/app/services/sidebar/sidebar.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { Subscription } from 'rxjs';
import { ICart } from 'src/app/models/cart/cart.model';
import { CartItemComponent, IChangeQuantityEvent } from "../cart-item/cart-item.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from 'src/app/services/order/order.service';
import { IOrder } from 'src/app/models/order/order.model';
import { ICartCheckout } from 'src/app/models/cart/cart-checkout.model';
import { SecurityService } from 'src/app/services/security/security.service';

export const CART_SIDEBAR_ID: string = 'CART_SIDEBAR_ID';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  providers: [provideIcons({ bootstrapCart3, bootstrapChevronRight, bootstrapTrash3, bootstrapXLg })],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss'],
  imports: [CommonModule, NgIconComponent, CartItemComponent, RouterLink, RouterLinkActive]
})
export class CartSidebarComponent implements ISidebar, OnDestroy {
  readonly id: string = CART_SIDEBAR_ID;
  readonly isOpen: WritableSignal<boolean> = signal(false);
  readonly closeClicked: WritableSignal<boolean> = signal(false);

  private _subscriptions: Subscription[] = [];

  readonly cart: WritableSignal<ICart> = signal(<ICart>{});

  readonly totalItemCount: Signal<number> = computed(() => {
    let totalCount = 0;
    this.cart().items.forEach(item => {
      totalCount += item.quantity;
    });

    return totalCount;
  });

  readonly totalPrice: Signal<number> = computed(() => {
    let totalPrice = 0;
    this.cart().items.forEach(item => {
      totalPrice += (item.unitPrice * item.quantity);
    });

    return totalPrice;
  });


  constructor(
    private _sidebarService: SidebarService,
    private _cartService: CartService,
    private _orderService: OrderService,
    private _securityService: SecurityService) {

    _sidebarService.add(this);
    this.cart.set(_cartService.cart);

    // Track Cart changes
    this._subscriptions.push(
      this._cartService.cartUpdate$
        .subscribe((cart) => {
          this.cart.set(this._cartService.cart);
        })
    );

    // Throttle server updates arising from changes made to the Cart
    // this._subscriptions.push(
    //   this._updateCartSubject.asObservable()
    //     .pipe(debounceTime(1000))
    //     .subscribe((cart: ICart) => {
    //       this._cartService.setCart(this.cart()).subscribe();
    //     })
    // );
  }


  clearCart() {
    this._cartService.clearCart();
  }


  changeQuantity(event: IChangeQuantityEvent) {
    this._cartService.changeItemQuantity(event.itemIndex, event.newQuantity);
  }


  decreaseQuantity(itemIndex: number) {
    this._cartService.decreaseItemQuantity(itemIndex);
  }


  handleClose() {
    this.closeClicked.set(true);
    setTimeout(() => {
      this.isOpen.set(false);
      this.closeClicked.set(false);
    }, 200);
  }


  handlePayment() {
    if (!this._securityService.isAuthorized) {
      this._securityService.login();
      return;
    }

    let order: IOrder = this._orderService.createOrderFromCartAndIdentity();
    let cartCheckout: ICartCheckout = this._cartService.createCartCheckoutFromOrder(order);

    this._orderService.setCartCheckout(cartCheckout)
      .subscribe((url: string) => {
        window.location.href = url;
      });
  }


  increaseQuantity(itemIndex: number) {    
    this._cartService.increaseItemQuantity(itemIndex);
  }


  removeItem(itemIndex: number) {
    this._cartService.removeItem(itemIndex);
  }


  ngOnDestroy(): void {
    this._sidebarService.remove(this);
    this._subscriptions.forEach(s => s.unsubscribe());
  }


  private _randomIntFromInterval(min: number, max: number) {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


}
