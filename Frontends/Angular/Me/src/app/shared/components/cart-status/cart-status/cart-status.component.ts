import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapCart3 } from '@ng-icons/bootstrap-icons';
import { CartService } from 'src/app/services/cart/cart.service';

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
export class CartStatusComponent implements OnInit {
  badge: WritableSignal<number> = signal(0);

  constructor(private _cartService: CartService) { }


  ngOnInit(): void {
    this._cartService.cartUpdate$
      .subscribe((cart) => { 
        this.badge.set(cart.items.length);
      })
  }
}
