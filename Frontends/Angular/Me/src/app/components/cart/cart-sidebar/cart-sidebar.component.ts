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
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from 'src/app/services/order/order.service';
import { ICheckoutResponse, IOrderCheckout } from 'src/app/models/order/order.model';
import { CheckoutMode, ICartCheckout } from 'src/app/models/cart/cart-checkout.model';
import { SecurityService } from 'src/app/services/security/security.service';
import { IStripeSuccessComponent, isStripeSuccessComponent } from 'src/app/models/order/stripe-success-route.model';
import { IStripeCancelComponent, isStripeCancelComponent } from 'src/app/models/order/stripe-cancel-route.model';

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
    private _securityService: SecurityService,
    private _router: Router) {

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

    let order: IOrderCheckout = this._orderService.createOrderFromCartAndIdentity();
    let cartCheckout: ICartCheckout = this._cartService.createCartCheckoutFromOrder(order);

    //cartCheckout = this._configureCheckoutMode(CheckoutMode.Redirect, cartCheckout);
    cartCheckout = this._configureCheckoutMode(CheckoutMode.Intent, cartCheckout);

    this._orderService.setCartCheckout(cartCheckout)
      .subscribe((response: ICheckoutResponse) => {
        if (CheckoutMode.Redirect == cartCheckout.mode) {
          // Cart gets cleard in OrderService and cloud Integration Event
          window.location.href = response.url;
        } else {
          this._router.navigate([`/checkout/${response.orderId}`]); 
          this.handleClose();
        }
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


  private _configureCheckoutMode(mode: CheckoutMode, cartCheckout: ICartCheckout): ICartCheckout {
    if (CheckoutMode.Redirect == mode) {
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

      cartCheckout.cancelRoute = `/${cancelRoute.path}`;
      cartCheckout.successRoute = `/${successRoute.path}`;
    }

    cartCheckout.mode = mode;
    return cartCheckout;
  }


}
