import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { IOrderDetails } from 'src/app/models/order/order.model';
import { switchMap } from 'rxjs';
import { OrderService } from 'src/app/services/order/order.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapChevronLeft } from '@ng-icons/bootstrap-icons';
import { OrderComponent } from "../../../components/order/order/order.component";
import { OrderItemComponent } from "../../../components/order/order-item/order-item.component";

@Component({
  selector: 'app-checkout',
  standalone: true,
  providers: [provideIcons({ bootstrapChevronLeft })],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [CommonModule, NgIconComponent, OrderComponent, OrderItemComponent]
})
export class CheckoutComponent implements OnInit {
  readonly order: WritableSignal<IOrderDetails> = signal(<IOrderDetails>{});
  readonly loading: WritableSignal<boolean> = signal(false);
  readonly paymentMessage: WritableSignal<string> = signal('');
  private _stripe: Stripe | null = null;
  private _clientSecret: string = '';
  elements: StripeElements | undefined;
  emailAddress: string = '';
  private _orderId: number = -1;

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute) {
    this._initStripe();
  }


  async handlePayNow(e: any, elements: StripeElements) {
    e.preventDefault();
    if (0 > this._orderId) return;
    this.loading.set(true);

    let result = await this._stripe?.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/order-details/${this._orderId}`,
        receipt_email: this.emailAddress
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (result) {
      let error = result.error
      if (error.message && (error.type === "card_error" || error.type === "validation_error")) {
        this.paymentMessage.set(error.message);
      } else {
        this.paymentMessage.set("An unexpected error occurred.");
      }

      this.loading.set(false);
    }
  }


  /**
   * Stripe recommends creating a new Session each time your customer attempts to pay…
   * https://stripe.com/docs/api/checkout/sessions
   */
  ngOnInit(): void {
    this._loadOrder();
    this._loadStripe();
  }


  private async _initStripe() {
    this._stripe = await loadStripe(environment.stripePublishableKey);
    console.log(`--> Stripe initialized: ${null != this._stripe}`);
  }


  private _loadOrder() {
    this._route.paramMap
      .pipe(
        switchMap((params) => {
          this._orderId = Number(params.get('orderId'));
          return this._orderService.getOrderStatus(this._orderId)
        })).subscribe((orderStatus) => {
          this.order.set(orderStatus);
        });
  }


  private _loadStripe() {
    this._route.paramMap.subscribe((params) => {
      this._clientSecret = params.get('checkoutId') ?? '';

      this.elements = this._stripe?.elements({
        appearance: {
          theme: 'night'
        },
        clientSecret: this._clientSecret
      });

      let linkAuthenticationElement = this.elements?.create("linkAuthentication");
      linkAuthenticationElement?.mount("#link-authentication-element");
      linkAuthenticationElement?.on('change', (event) => {
        this.emailAddress = event.value.email;
      });

      let paymentElement = this.elements?.create("payment", {
        layout: 'tabs'
      });
      paymentElement?.mount("#payment-element");
    });
  }

}
