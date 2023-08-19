import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ICatalog } from 'src/app/models/catalog.model';
import { SliderComponent } from "../slider/slider.component";

@Component({
  selector: 'app-related-products',
  standalone: true,
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.scss'],
  imports: [CommonModule, SliderComponent]
})
export class RelatedProductsComponent {
  readonly relatedCatalog: WritableSignal<ICatalog> = signal(<ICatalog>{});

  private _productTypeId: number = -1;
  @Input() public set productTypeId(value: number) {
    this._productTypeId = value;
    this._loadRelated();
  }

  constructor(private _catalogService: CatalogService) { }


  private _loadRelated() {
    if (1 > this.productTypeId) return;

    this._catalogService.getCatalog(0, 12, this._productTypeId)
      .subscribe(catalog => {
        this.relatedCatalog.set(catalog);
      });
  }

}


