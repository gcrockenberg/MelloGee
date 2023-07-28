import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBagPlus, bootstrapInfoCircle } from "@ng-icons/bootstrap-icons";
import { CartService } from 'src/app/services/cart/cart.service';
import { CATALOG_ITEM_MODAL } from '../catalog-item-modal/catalog-item-modal.component';
import { ModalService } from 'src/app/services/modal/modal.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapBagPlus, bootstrapInfoCircle })],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  item: WritableSignal<ICatalogItem> = signal(<ICatalogItem>{});
  @Input() set product(value: ICatalogItem) {
    this.item.set(value);
  }
  get product(): ICatalogItem { return this.item() }


  constructor(
    private _cartService: CartService,
    private _modalService: ModalService) { }


  addToCart() {
    this._cartService.addCatalogItemToCart(this.item());
  }


  // TODO: Handle catalog item not found
  displayItemDetails() {
    this._modalService.open(CATALOG_ITEM_MODAL, this.item().id)
  }

}
