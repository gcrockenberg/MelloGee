import { Component, Input, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { IPager } from 'src/app/models/utils/pager.model';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { CategoryNavComponent } from "../../components/catalog/category-nav/category-nav.component";
import { ProductComponent } from "../../components/catalog/product/product.component";
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { CatalogItemModalComponent } from "../../components/catalog/catalog-item-modal/catalog-item-modal.component";

@Component({
    selector: 'app-products',
    standalone: true,
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    imports: [CommonModule, CategoryNavComponent, ProductComponent, CatalogItemModalComponent]
})
export class ProductsComponent implements OnInit {
  readonly items: WritableSignal<ICatalogItem[]> = signal([]);
  private _catalog!: ICatalog;
  @Input() set catalog(value: ICatalog) {
    this.items.set(value.data);
    this._catalog = value;
  }
  get catalog(): ICatalog { return this._catalog }
  paginationInfo!: IPager;
  errorReceived: boolean = false;
  readonly productType: Signal<string> = computed(() => {
    return (0 < this.items().length) ? this.items()[0].catalogType.type : '';
  });

  constructor(private _route: ActivatedRoute, private _catalogService: CatalogService) { }

  ngOnInit() {
    this._route.paramMap
      .pipe(
        switchMap((params) => {
          let productTypeId = Number(params.get('typeId'));
          return this._catalogService.getCatalog(0, 12, productTypeId);
        })).subscribe((catalog: ICatalog) => {
          this.catalog = catalog;
        });
  }


  private _handleError(error: any) {
    this.errorReceived = true;
    return throwError(() => error);
  }

}
