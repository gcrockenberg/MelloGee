import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapDash, bootstrapPlusLg } from "@ng-icons/bootstrap-icons";

@Component({
  selector: 'app-quantity-buttons',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapDash, bootstrapPlusLg })],
  templateUrl: './quantity-buttons.component.html',
  styleUrls: ['./quantity-buttons.component.scss']
})
export class QuantityButtonsComponent {
  @Output() onDecreaseQuantity: EventEmitter<void> = new EventEmitter();
  @Output() onIncreaseQuantity: EventEmitter<void> = new EventEmitter();
  @Output() onChangeQuantity: EventEmitter<number> = new EventEmitter();
  @Input() value: number = 0;


  decreaseQuantity() {
    this.onDecreaseQuantity.emit();
  }


  handleInput(e: any) {
    let newQuantity: number = Number(e.target.value);
    if (newQuantity != this.value) {
      this.onChangeQuantity.emit(newQuantity);
    }   
  }


  increaseQuantity() {
    this.onIncreaseQuantity.emit();
  }

}
