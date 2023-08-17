import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IOrderSummary } from 'src/app/models/order/order.model';

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
    this.order.set(value);
  }
  get orderSummary(): IOrderSummary { return this.order() }

  constructor(private _router: Router) {}

  displayOrderDetails() {    
    this._router.navigate([`/order-details/${this.order().orderNumber}`]); 
  }
}
