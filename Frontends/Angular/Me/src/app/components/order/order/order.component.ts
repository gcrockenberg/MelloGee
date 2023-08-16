import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderDetails } from 'src/app/models/order/order.model';
import { OrderItemComponent } from "../order-item/order-item.component";

@Component({
    selector: 'app-order',
    standalone: true,
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    imports: [CommonModule, OrderItemComponent]
})
export class OrderComponent {
  order: WritableSignal<IOrderDetails> = signal(<IOrderDetails>{});
  @Input() set orderStatus(value: IOrderDetails) {
    this.order.set(value);
  }
  get orderStatus(): IOrderDetails { return this.order() }

}
