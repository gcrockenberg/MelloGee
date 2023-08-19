import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrderDetailsResponse } from 'src/app/models/order.model';
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
  order: WritableSignal<IOrderDetailsResponse> = signal(<IOrderDetailsResponse>{});
  @Input() set orderStatus(value: IOrderDetailsResponse) {
    this.order.set(value);
  }
  get orderStatus(): IOrderDetailsResponse { return this.order() }

  constructor(private _router: Router) {}

  payNow() {    
    this._router.navigate([`/checkout/${this.order().orderNumber}`]); 
  }

}
