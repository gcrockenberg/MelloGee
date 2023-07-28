import { Component, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapCart3 } from '@ng-icons/bootstrap-icons';
import { CartService } from 'src/app/services/cart/cart.service';
import { SidebarService } from 'src/app/services/sidebar/sidebar.service';
import { CART_SIDEBAR_ID } from 'src/app/components/cart-sidebar/cart-sidebar.component';
import { ICart } from 'src/app/models/cart/cart.model';

@Component({
  selector: 'app-cart-status',
  standalone: true,
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.scss'],
  providers: [provideIcons({ bootstrapCart3 })],
  imports: [
    CommonModule,
    NgIconComponent,
    RouterLink,
    RouterLinkActive],
})
export class CartStatusComponent {
  readonly badge: WritableSignal<number> = signal(0);

  constructor(
    private _cartService: CartService,
    private _sidebarService: SidebarService
  ) { 
    this.badge.set(this._cartService.cart.items.length);
    this._cartService.cartUpdate$
      .subscribe((cart) => { 
        this.badge.set(this._totalItemCount(cart));
      })
  }


  openCartSidebar() { 
    this._sidebarService.open(CART_SIDEBAR_ID);
  }


  private _totalItemCount(cart: ICart) {
    let totalCount = 0;
    cart.items.forEach(item => {
      totalCount += item.quantity;
    });

    return totalCount;
  };


}
