import { Component, EventEmitter, Input, Output, Signal, WritableSignal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICartItem } from 'src/app/models/cart/cart-item.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapDash, bootstrapPlusLg, bootstrapX } from "@ng-icons/bootstrap-icons";
import { ModalService } from 'src/app/services/modal/modal.service';
import { CATALOG_ITEM_MODAL } from '../catalog-item-modal/catalog-item-modal.component';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapDash, bootstrapPlusLg, bootstrapX })],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {
  item: WritableSignal<ICartItem> = signal(<ICartItem>{});
  @Input() set product(value: ICartItem) {
    this.item.set(value);
  }
  get product(): ICartItem { return this.item() }
  
  @Input() index: number = 0;
  @Output() onRemoveItem: EventEmitter<number> = new EventEmitter();
  @Output() onDecreaseQuantity: EventEmitter<number> = new EventEmitter();
  @Output() onIncreaseQuantity: EventEmitter<number> = new EventEmitter();

  readonly subTotal: Signal<number> = computed(() => {
    return this.item().unitPrice * this.item().quantity;
  });


  constructor(private _modalService: ModalService) { }


  decreaseQuantity() { 
    this.onDecreaseQuantity.emit(this.index);
  }


  displayItemDetails() {   
    this._modalService.open(CATALOG_ITEM_MODAL, this.item().productId)  
  }


  increaseQuantity() {
    this.onIncreaseQuantity.emit(this.index);
  }


  removeItem() {
    this.onRemoveItem.emit(this.index);
  }


}
