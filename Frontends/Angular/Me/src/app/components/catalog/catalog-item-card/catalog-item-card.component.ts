import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBagPlus } from "@ng-icons/bootstrap-icons";
import { ModalService } from 'src/app/services/modal/modal.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-catalog-item-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapBagPlus })],
  templateUrl: './catalog-item-card.component.html',
  styleUrls: ['./catalog-item-card.component.scss']
})
export class CatalogItemCardComponent {
  @Input() item!: ICatalogItem;

  constructor(
    public modalService: ModalService,
    private _cartService: CartService) { }
  

  addToCart(item: ICatalogItem) {
    this._cartService.addCatalogItemToCart(item);
  }
  
}
