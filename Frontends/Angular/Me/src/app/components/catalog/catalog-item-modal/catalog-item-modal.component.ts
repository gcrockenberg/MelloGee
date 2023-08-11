import { Component, Input, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBagPlus, bootstrapXLg } from "@ng-icons/bootstrap-icons"
import { ButtonAddToCartComponent } from "../../cart/button-add-to-cart/button-add-to-cart.component";
import { ModalService } from 'src/app/services/modal/modal.service';
import { IModal } from 'src/app/models/modal/modal.model';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { RelatedProductsComponent } from "../related-products/related-products.component";
import { ICatalog } from 'src/app/models/catalog/catalog.model';

export const CATALOG_ITEM_MODAL: string = 'CATALOG_ITEM_MODAL';

@Component({
  selector: 'app-catalog-item-modal',
  standalone: true,
  providers: [provideIcons({ bootstrapBagPlus, bootstrapXLg })],
  templateUrl: './catalog-item-modal.component.html',
  styleUrls: ['./catalog-item-modal.component.scss'],
  imports: [CommonModule, NgIconComponent, ButtonAddToCartComponent, RelatedProductsComponent]
})
export class CatalogItemModalComponent implements IModal, OnInit, OnDestroy {
  readonly id: string = CATALOG_ITEM_MODAL;
  readonly isOpen: WritableSignal<boolean> = signal(false);
  readonly itemLoaded: WritableSignal<boolean> = signal(false);
  readonly item: WritableSignal<ICatalogItem> = signal(<ICatalogItem>{});

  constructor(
    private _catalogService: CatalogService,
    public modalService: ModalService,
    private _cartService: CartService) { }


  addToCart() {
    this._cartService.addCatalogItemToCart(this.item());
  }


  ngOnInit() {
    // add self (this modal instance) to the modal service so it can be opened from any component
    this.modalService.add(this);
  }


  open() {
    this.isOpen.set(true);
  }


  close() {
    this.isOpen.set(false);
  }


  // TODO: Handle not found
  setTarget<T>(target: T) {
    this.itemLoaded.set(false);
    this._catalogService.getCatalogItem(target as number)
      .subscribe((catalogItem) => {
        this.item.set(catalogItem);
        this.itemLoaded.set(true);
      });
  }

  ngOnDestroy(): void {
    // remove self from modal service
    this.modalService.remove(this);
  }

}

