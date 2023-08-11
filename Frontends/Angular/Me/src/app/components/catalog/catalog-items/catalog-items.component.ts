import { Component, Input, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { CatalogItemCardComponent } from "../catalog-item-card/catalog-item-card.component";
import { CatalogItemModalComponent } from "../catalog-item-modal/catalog-item-modal.component";
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { ProductComponent } from "../product/product.component";

@Component({
    selector: 'app-catalog-items',
    standalone: true,
    templateUrl: './catalog-items.component.html',
    styleUrls: ['./catalog-items.component.scss'],
    imports: [CommonModule, NgFor, CatalogItemCardComponent, CatalogItemModalComponent, ProductComponent]
})
export class CatalogItemsComponent {
  readonly items: WritableSignal<ICatalogItem[]> = signal([]);
  private _catalog!: ICatalog;
  @Input() set catalog(value: ICatalog) {
    this.items.set(value.data);
    this._catalog = value;
  }
  get catalog(): ICatalog { return this._catalog }

  @Input() title: string = '';

}
