import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBagPlus, bootstrapInfoCircle } from "@ng-icons/bootstrap-icons";
import { CartService } from 'src/app/services/cart/cart.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { Router } from '@angular/router';
import { ICatalogItem } from 'src/app/models/catalog.model';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapBagPlus, bootstrapInfoCircle })],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  readonly item: WritableSignal<ICatalogItem> = signal(<ICatalogItem>{});
  @Input() set product(value: ICatalogItem) {
    this.item.set(value);
  }
  get product(): ICatalogItem { return this.item() }


  constructor(
    private _cartService: CartService,
    private _modalService: ModalService,
    private _router: Router) { }


  addToCart() {
    this._cartService.addCatalogItemToCart(this.item());
  }


  displayItemDetails() {    
    this._router.navigate([`/product-details/${this.item().id}`]); 
    this.gotoTop();
    //this._modalService.open(CATALOG_ITEM_MODAL, this.item().id)
  }


  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}
