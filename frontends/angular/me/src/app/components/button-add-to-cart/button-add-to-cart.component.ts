import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBagPlus } from "@ng-icons/bootstrap-icons"

@Component({
  selector: 'app-button-add-to-cart',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapBagPlus })],
  templateUrl: './button-add-to-cart.component.html',
  styleUrls: ['./button-add-to-cart.component.scss']
})
export class ButtonAddToCartComponent {
  @Input() itemId: number | undefined;
}
