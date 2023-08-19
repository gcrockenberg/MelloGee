import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from "../slider/slider.component";
import { ICatalog, ICatalogItem } from 'src/app/models/catalog.model';

@Component({
    selector: 'app-latest-products',
    standalone: true,
    templateUrl: './latest-products.component.html',
    styleUrls: ['./latest-products.component.scss'],
    imports: [CommonModule, SliderComponent]
})
export class LatestProductsComponent {
  readonly items: WritableSignal<ICatalogItem[]> = signal([]);
    private _catalog!: ICatalog;
    @Input() set catalog(value: ICatalog) {
      this.items.set(value.data);
      this._catalog = value;
    }
    get catalog(): ICatalog { return this._catalog }
}
