import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quantity-select.component.html',
  styleUrls: ['./quantity-select.component.scss']
})
export class QuantitySelectComponent {
  @Output() onChangeQuantity: EventEmitter<number> = new EventEmitter();
  @Input() value: number = 0;


  handleSelectChange(e: any) {
    let newQuantity: number = Number(e.target.value);
    this.onChangeQuantity.emit(newQuantity);
  }

}
