import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from 'src/app/services/order/order.service';
import { IOrderStatus } from 'src/app/models/order/order.model';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { OrderComponent } from "../../../components/order/order/order.component";
import { OrderItemComponent } from "../../../components/order/order-item/order-item.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapChevronLeft } from '@ng-icons/bootstrap-icons';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-order-details',
    standalone: true,
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.scss'],
    imports: [CommonModule, NgIconComponent, OrderComponent, OrderItemComponent, RouterLink],
    providers: [provideIcons({ bootstrapChevronLeft })]   
})
export class OrderDetailsComponent implements OnInit {
  readonly order: WritableSignal<IOrderStatus> = signal(<IOrderStatus>{});

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute) { }


  ngOnInit(): void {
    this._route.paramMap
      .pipe(
        switchMap((params) => {
          let orderId = Number(params.get('id'));
          return this._orderService.getOrderStatus(orderId)
        })).subscribe((orderStatus) => {
          this.order.set(orderStatus);
        });
  }


}
