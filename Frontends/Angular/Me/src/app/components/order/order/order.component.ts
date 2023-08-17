import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderDetails } from 'src/app/models/order/order.model';
import { OrderItemComponent } from "../order-item/order-item.component";
import { Router } from '@angular/router';

@Component({
    selector: 'app-order',
    standalone: true,
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    imports: [CommonModule, OrderItemComponent]
})
export class OrderComponent {
  @Input() enablePayNow: boolean = false;
  order: WritableSignal<IOrderDetails> = signal(<IOrderDetails>{});
  @Input() set orderStatus(value: IOrderDetails) {
    this.order.set(value);
  }
  get orderStatus(): IOrderDetails { return this.order() }

  constructor(private _router: Router) {}

  payNow() {    
    this._router.navigate([`/checkout/${this.order().orderNumber}`]); 
  }

}
