import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityService } from 'src/app/services/security/security.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  constructor(private _securityService: SecurityService) { }

}
