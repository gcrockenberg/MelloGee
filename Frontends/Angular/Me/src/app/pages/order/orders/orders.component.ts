import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IStripeSuccessComponent } from 'src/app/models/order/stripe-success-route.model';
import { IStripeCancelComponent } from 'src/app/models/order/stripe-cancel-route.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements IStripeSuccessComponent, IStripeCancelComponent {


  isStripeCancelComponent(): this is IStripeCancelComponent {
    return true;
  }
  
  isStripeSuccessComponent(): this is IStripeSuccessComponent {
    return true;
  }
}
