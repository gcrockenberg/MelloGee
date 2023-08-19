import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { CheckoutMode, IOrderDetailsResponse, IPayOrderRequest, IStripeCancelComponent, IStripeSuccessComponent, isStripeCancelComponent, isStripeSuccessComponent } from 'src/app/models/order.model';
import { Subscription, switchMap } from 'rxjs';
import { OrderService } from 'src/app/services/order/order.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapChevronLeft } from '@ng-icons/bootstrap-icons';
import { OrderComponent } from "../../../components/order/order/order.component";
import { OrderItemComponent } from "../../../components/order/order-item/order-item.component";
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ISignalREvent } from 'src/app/models/signal-r.model';


@Component({
  selector: 'app-checkout',
  standalone: true,
  providers: [provideIcons({ bootstrapChevronLeft })],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [CommonModule, NgIconComponent, OrderComponent, OrderItemComponent, RouterLink]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];
  readonly order: WritableSignal<IOrderDetailsResponse> = signal(<IOrderDetailsResponse>{});
  readonly paymentMessage: WritableSignal<string> = signal('');
  readonly buttonText: WritableSignal<string> = signal('Pay now');
  readonly isLoading: WritableSignal<boolean> = signal(false);
  private _stripe: Stripe | null = null;
  private _clientSecret: string = '';
  elements: StripeElements | undefined;
  emailAddress: string = '';
  private _orderId: number = -1;

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _signalRService: SignalRService) {
    this._initStripe();
  }


  async handlePayNow(e: any, elements: StripeElements | undefined) {
    e.preventDefault();
    if (!elements) return;
    if (0 > this._orderId) return;
    this._setLoading(true);

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

      this._showMessage();
      this._setLoading(false);
    }
  }


  ngOnInit(): void {
    this._loadPayOrder();
    this._trackOrderChanges();
  }


  private async _initStripe() {
    this._stripe = await loadStripe(environment.stripePublishableKey);
  }


  private _loadPayOrder(withStripe: boolean = true) {
    this._route.paramMap
      .pipe(
        switchMap((params) => {
          this._orderId = Number(params.get('orderId'));
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

          let orderCheckout: IPayOrderRequest = {
            orderId: this._orderId,
            mode: CheckoutMode.Intent,
            cancelRoute: `/${cancelRoute.path}`,
            successRoute: `/${successRoute.path}`
          }

          return this._orderService.getPayOrder(orderCheckout);

        })).subscribe((orderDetails: IOrderDetailsResponse) => {
          this.order.set(orderDetails);
          if (withStripe) {
            this._clientSecret = orderDetails.clientSecret;
            this._loadStripe();
          }
        });
  }


  private _loadStripe() {
    this._route.paramMap.subscribe((params) => {
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


  private _trackOrderChanges() {
    this._subscriptions.push(
      this._signalRService.messageReceived$
        .subscribe((event: ISignalREvent) => {
          if (this.order().orderNumber == event.orderId) {
            this.order.mutate(o => o.status = event.status);
          }
        })
    );
  }

  // ------- UI helpers -------

  private _showMessage() {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer?.classList.remove("hidden");
    setTimeout(function () {
      messageContainer?.classList.add("hidden");
    }, 4000);
  }


  // Show a spinner on payment submission
  private _setLoading(isLoading: boolean) {
    this.isLoading.set(isLoading);
    if (isLoading) {
      this.buttonText.set('Processing...');
    } else {
      this.buttonText.set('Pay now');
    }
  }


  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }


}
