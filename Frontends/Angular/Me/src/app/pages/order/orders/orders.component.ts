import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IStripeSuccessComponent } from 'src/app/models/order/stripe-success-route.model';
import { IStripeCancelComponent } from 'src/app/models/order/stripe-cancel-route.model';
import { OrderService } from 'src/app/services/order/order.service';
import { catchError, throwError } from 'rxjs';
import { OrderComponent } from "../../../components/order/order/order.component";
import { OrderSummaryComponent } from "../../../components/order/order-summary/order-summary.component";
import { IOrderSummary } from 'src/app/models/order/order.model';

@Component({
    selector: 'app-orders',
    standalone: true,
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    imports: [CommonModule, OrderComponent, OrderSummaryComponent]
})
export class OrdersComponent implements OnInit, IStripeSuccessComponent, IStripeCancelComponent {
  errorReceived: boolean = false;
  readonly orders: WritableSignal<IOrderSummary[]> = signal([]);

  constructor(private _orderService: OrderService) { }


  ngOnInit(): void {
    this.getOrders();
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

}
