import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderStatus } from 'src/app/models/order/order.model';
import { OrderItemComponent } from "../order-item/order-item.component";

@Component({
    selector: 'app-order',
    standalone: true,
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    imports: [CommonModule, OrderItemComponent]
})
export class OrderComponent {
  order: WritableSignal<IOrderStatus> = signal(<IOrderStatus>{});
  @Input() set orderStatus(value: IOrderStatus) {
    this.order.set(value);
  }
  get orderStatus(): IOrderStatus { return this.order() }

}
