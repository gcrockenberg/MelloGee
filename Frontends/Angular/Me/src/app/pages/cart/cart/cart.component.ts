import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from 'src/app/services/cart/cart.service';
import { ICart } from 'src/app/models/cart/cart.model';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: ICart = {
    buyerId: '',
    items: []
  };
  totalPrice: number = 0;

  constructor(private _cartService: CartService, private _configurationService: ConfigurationService) { }


  async ngOnInit(): Promise<void> {
    if (this._configurationService.isReady) {
      (await this._cartService.getCart()).subscribe(cart => {
        this.cart = cart;
        this._calculateTotalPrice();
      });
    }
    else {
      this._configurationService.settingsLoaded$.subscribe(async x => {
        (await this._cartService.getCart()).subscribe(cart => {
          this.cart = cart;
          this._calculateTotalPrice();
        });
      });
    }
  }


  private _calculateTotalPrice() {
    this.totalPrice = 0;
    this.cart.items.forEach(item => {
      this.totalPrice += (item.unitPrice * item.quantity);
    });
  }


}
