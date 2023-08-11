import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderItem } from 'src/app/models/order/order-item.model';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent {
  private _orderItem!: IOrderItem;
  @Input() set orderItem(value: IOrderItem) {
    console.log('--> received order item: ', value);
    this._orderItem = value;
  }
  get orderItem(): IOrderItem { return this._orderItem }
  
}
