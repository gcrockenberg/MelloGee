import { Component, Input } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { CatalogItemCardComponent } from "../catalog-item-card/catalog-item-card.component";
import { CatalogItemModalComponent } from "../catalog-item-modal/catalog-item-modal.component";

@Component({
    selector: 'app-catalog-items',
    standalone: true,
    templateUrl: './catalog-items.component.html',
    styleUrls: ['./catalog-items.component.scss'],
    imports: [CommonModule, NgFor, CatalogItemCardComponent, CatalogItemModalComponent]
})
export class CatalogItemsComponent {
  @Input() catalog!: ICatalog;;
  @Input() title: string = '';
}
