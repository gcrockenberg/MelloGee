import { Component, EventEmitter, Input, Output, Signal, WritableSignal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapDash, bootstrapPlusLg, bootstrapX } from "@ng-icons/bootstrap-icons";
import { Router } from '@angular/router';
import { QuantityButtonsComponent } from "../quantity-buttons/quantity-buttons.component";
import { QuantitySelectComponent } from "../quantity-select/quantity-select.component";
import { ICartItem } from 'src/app/models/cart.model';

export interface IChangeQuantityEvent {
  itemIndex: number;
  newQuantity: number;
}

@Component({
    selector: 'app-cart-item',
    standalone: true,
    providers: [provideIcons({ bootstrapDash, bootstrapPlusLg, bootstrapX })],
    templateUrl: './cart-item.component.html',
    styleUrls: ['./cart-item.component.scss'],
    imports: [CommonModule, NgIconComponent, QuantityButtonsComponent, QuantitySelectComponent]
})
export class CartItemComponent {
  readonly item: WritableSignal<ICartItem> = signal(<ICartItem>{});
  @Input() set product(value: ICartItem) {
    this.item.set(value);
  }
  get product(): ICartItem { return this.item() }
  
  @Input() index: number = 0;
  @Output() onRemoveItem: EventEmitter<number> = new EventEmitter();
  @Output() onDecreaseQuantity: EventEmitter<number> = new EventEmitter();
  @Output() onIncreaseQuantity: EventEmitter<number> = new EventEmitter();
  @Output() onChangeQuantity: EventEmitter<IChangeQuantityEvent> = new EventEmitter();

  readonly subTotal: Signal<number> = computed(() => {
    return this.item().unitPrice * this.item().quantity;
  });


  constructor(private _router: Router) { }


  changeQuantity(newQuantity: number) {
    this.onChangeQuantity.emit({
      itemIndex: this.index,
      newQuantity: newQuantity
    })
  }


  decreaseQuantity() { 
    this.onDecreaseQuantity.emit(this.index);
  }


  displayItemDetails() {       
    this._router.navigate([`/product-details/${this.item().productId}`]); 
  }


  increaseQuantity() {
    this.onIncreaseQuantity.emit(this.index);
  }


  removeItem() {
    this.onRemoveItem.emit(this.index);
  }


}
