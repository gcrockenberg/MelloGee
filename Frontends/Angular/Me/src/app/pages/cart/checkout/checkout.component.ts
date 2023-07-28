import { Component, OnDestroy, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from 'src/app/services/cart/order.service';
import { IOrder } from 'src/app/models/order/order.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from 'src/app/services/cart/cart.service';
import { Subscription, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ICartCheckout } from 'src/app/models/cart/cart-checkout.model';
import { InputComponent } from "../../../shared/components/input/input.component";
import { ICart } from 'src/app/models/cart/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  order: IOrder = <IOrder>{};
  form!: FormGroup;

  private readonly _subTotal: Signal<number> = computed(() => {
    let totalPrice = 0;
    this._cartService.cart.items.forEach(item => {
      totalPrice += (item.unitPrice * item.quantity);
    });

    return totalPrice;
  });
  public get subTotal(): Signal<number> {
    return this._subTotal;
  }

  readonly tax: Signal<number> = computed(() => this.subTotal() * .06);
  readonly shipping = this._randomIntFromInterval(3, 10);
  readonly totalPrice: Signal<number> = computed(() => this.subTotal() + this.tax() + this.shipping);


  isOrderProcessing: boolean = false;
  errorReceived: boolean = false;

  constructor(
    private _orderService: OrderService,
    private _fb: FormBuilder,
    private _cartService: CartService,
    private _router: Router) {

    this._checkRedirect();

    this._subscriptions.push(
      this._cartService.cartUpdate$
        .subscribe((cart) => {
          this._checkRedirect();
        })
    );

    this.order = _orderService.createOrderFromCartAndIdentity();
    this.form = this._fb.nonNullable.group({
      street: [this.order.street, [Validators.required]],
      city: [this.order.city, [Validators.required]],
      state: [this.order.state, [Validators.required]],
      country: [this.order.country, [Validators.required]],
      postalCode: [this.order.zipcode, [Validators.required]],
      cardnumber: [this.order.cardnumber, [Validators.required]],
      cardholdername: [this.order.cardholdername, [Validators.required]],
      expirationdate: [this.order.expiration, [Validators.required]],
      securitycode: [this.order.cardsecuritynumber, [Validators.required]],
    });
  }


  submitForm() {
    this.order.street = this.form.controls['street'].value;
    this.order.city = this.form.controls['city'].value;
    this.order.state = this.form.controls['state'].value;
    this.order.country = this.form.controls['country'].value;
    this.order.cardnumber = this.form.controls['cardnumber'].value;
    this.order.cardtypeid = 1;
    this.order.cardholdername = this.form.controls['cardholdername'].value;
    // if (this.orderForm.controls['expirationdate']) {
    //   this.order.cardexpiration = new Date(20 + this.orderForm.controls['expirationdate'].value.split('/')[1], this.orderForm.controls['expirationdate'].value.split('/')[0]);
    // } else {
    this.order.cardexpiration = new Date();
    //}
    this.order.cardsecuritynumber = this.form.controls['securitycode'].value;
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


  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }


  private _checkRedirect() {
    if (1 > this._cartService.cart.items.length) {
      this._router.navigate(['/catalog']);
    }
  }

  
  private _randomIntFromInterval(min: number, max: number) {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}
