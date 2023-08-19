import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from 'src/app/services/order/order.service';
import { Subscription, catchError, throwError } from 'rxjs';
import { OrderComponent } from "../../../components/order/order/order.component";
import { OrderSummaryComponent } from "../../../components/order/order-summary/order-summary.component";
import { IOrderSummary, IStripeCancelComponent, IStripeSuccessComponent } from 'src/app/models/order.model';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ISignalREvent } from 'src/app/models/signal-r.model';

@Component({
    selector: 'app-orders',
    standalone: true,
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    imports: [CommonModule, OrderComponent, OrderSummaryComponent]
})
export class OrdersComponent implements OnInit, IStripeSuccessComponent, IStripeCancelComponent, OnDestroy {
  private _subscriptions: Subscription[] = [];
  errorReceived: boolean = false;
  readonly orders: WritableSignal<IOrderSummary[]> = signal([]);

  constructor(private _orderService: OrderService,
    private _signalRService: SignalRService) { }


  ngOnInit(): void {
    this.getOrders();
    this._trackOrderChanges();
  }


  getOrders() {
    this.errorReceived = false;
    this._orderService.getOrders()
      .pipe(catchError((err) => this._handleError(err)))
      .subscribe((orders: IOrderSummary[]) => {
        this.orders.set(orders);
      });
  }


  isStripeCancelComponent(): this is IStripeCancelComponent {
    return true;
  }

  isStripeSuccessComponent(): this is IStripeSuccessComponent {
    return true;
  }


  private _handleError(error: any) {
    this.errorReceived = true;
    return throwError(() => error);
  }


  private _trackOrderChanges() {
    this._subscriptions.push(
      this._signalRService.messageReceived$
        .subscribe((event: ISignalREvent) => {         
          this.orders.mutate(orders => {
            let index: number = orders.findIndex(o => o.orderNumber == event.orderId);
            if (-1 < index) {
              orders[index].status = event.status;
            }
          });          
        })
    );
  }


  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

}
