import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from 'src/app/services/order/order.service';
import { IOrderDetailsResponse } from 'src/app/models/order.model';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderComponent } from "../../../components/order/order/order.component";
import { OrderItemComponent } from "../../../components/order/order-item/order-item.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapChevronLeft } from '@ng-icons/bootstrap-icons';
import { RouterLink } from '@angular/router';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ISignalREvent } from 'src/app/models/signal-r.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  imports: [CommonModule, NgIconComponent, OrderComponent, OrderItemComponent, RouterLink],
  providers: [provideIcons({ bootstrapChevronLeft })]
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];
  readonly order: WritableSignal<IOrderDetailsResponse> = signal(<IOrderDetailsResponse>{});
  private _orderId: number = 0;

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute,
    private _signalRService: SignalRService) { }


  ngOnInit(): void {
    this._route.paramMap
      .subscribe((params) => {
        let orderId = Number(params.get('id'));
        this._orderId = orderId;
        this._loadOrder();
      });
    this._trackOrderChanges();
  }


  private _loadOrder() {
    this._orderService.getOrderStatus(this._orderId)
      .subscribe((orderStatus) => {
        this.order.set(orderStatus);
      });
  }


  private _trackOrderChanges() {
    this._subscriptions.push(
      this._signalRService.messageReceived$
        .subscribe((event: ISignalREvent) => {
          if (this._orderId == event.orderId) {
            this.order.mutate(o => o.status = event.status);
          }
        })
    );
  }


  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }


}
