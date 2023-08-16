import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderItem } from 'src/app/models/order/order.model';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent {
  readonly item: WritableSignal<IOrderItem> = signal(<IOrderItem>{});
  @Input() set product(value: IOrderItem) {
    this.item.set(value);
  }
  get product(): IOrderItem { return this.item() }
  
}
