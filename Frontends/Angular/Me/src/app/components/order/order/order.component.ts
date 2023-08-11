import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrder } from 'src/app/models/order/order.model';
import { OrderItemComponent } from "../order-item/order-item.component";

@Component({
    selector: 'app-order',
    standalone: true,
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    imports: [CommonModule, OrderItemComponent]
})
export class OrderComponent {
  private _order!: IOrder;
  @Input() set order(value: IOrder) {
    console.log('--> received order: ', value);
    this._order = value;
  }
  get order(): IOrder { return this._order }

}
