import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from 'src/app/services/cart/order.service';
import { IOrder } from 'src/app/models/order/order.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/services/cart/cart.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ICartCheckout } from 'src/app/models/cart/cart-checkout.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  order: IOrder = <IOrder>{};
  orderForm!: FormGroup;

  isOrderProcessing: boolean = false;
  errorReceived: boolean = false;

  constructor(
    private _orderService: OrderService,
    private _fb: FormBuilder,
    private _cartService: CartService,
    private _router: Router) {

    this.order = _orderService.createOrderFromCartAndIdentity();
    this.orderForm = this._fb.nonNullable.group({
      street: [this.order.street, [Validators.required]],
      city: [this.order.city, [Validators.required]],
      state: [this.order.state, [Validators.required]],
      country: [this.order.country, [Validators.required]],
      cardnumber: [this.order.cardnumber, [Validators.required]],
      cardholdername: [this.order.cardholdername, [Validators.required]],
      expirationdate: [this.order.expiration, [Validators.required]],
      securitycode: [this.order.cardsecuritynumber, [Validators.required]],
    });

    this.submitForm({});
  }


  submitForm(value: any) {
    this.order.street = this.orderForm.controls['street'].value;
    this.order.city = this.orderForm.controls['city'].value;
    this.order.state = this.orderForm.controls['state'].value;
    this.order.country = this.orderForm.controls['country'].value;
    this.order.cardnumber = this.orderForm.controls['cardnumber'].value;
    this.order.cardtypeid = 1;
    this.order.cardholdername = this.orderForm.controls['cardholdername'].value;
    // if (this.orderForm.controls['expirationdate']) {
    //   this.order.cardexpiration = new Date(20 + this.orderForm.controls['expirationdate'].value.split('/')[1], this.orderForm.controls['expirationdate'].value.split('/')[0]);
    // } else {
      this.order.cardexpiration = new Date();
    //}
    this.order.cardsecuritynumber = this.orderForm.controls['securitycode'].value;
    let cartCheckout: ICartCheckout = this._cartService.createCartCheckoutFromOrder(this.order);
    this._cartService.setCartCheckout(cartCheckout)
      .pipe(catchError((error) => {
        this.errorReceived = true;
        this.isOrderProcessing = false;
        return throwError(() => error);
      }))
      .subscribe(res => {
        this._router.navigate(['orders']);
      });
    this.errorReceived = false;
    this.isOrderProcessing = true;
  }


}
