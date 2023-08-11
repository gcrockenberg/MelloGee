import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderSummary } from 'src/app/models/order/order-summary.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent {
  order: WritableSignal<IOrderSummary> = signal(<IOrderSummary>{});
  @Input() set orderSummary(value: IOrderSummary) {
    console.log('--> received order: ', value);
    this.order.set(value);
  }
  get orderSummary(): IOrderSummary { return this.order() }
}
