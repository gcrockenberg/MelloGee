import { Component, Input, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { IPager } from 'src/app/models/utils/pager.model';
import { ProductComponent } from "../../../components/catalog/product/product.component";
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { CatalogItemModalComponent } from "../../../components/catalog/catalog-item-modal/catalog-item-modal.component";
import { CategoryNavComponent } from "../../../components/catalog/category-nav/category-nav.component";

@Component({
    selector: 'app-search-results',
    standalone: true,
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
    imports: [CommonModule, ProductComponent, CatalogItemModalComponent, CategoryNavComponent]
})
export class SearchResultsComponent implements OnInit {
  readonly items: WritableSignal<ICatalogItem[]> = signal([]);
  private _catalog!: ICatalog;
  @Input() set catalog(value: ICatalog) {
    this.items.set(value.data);
    this._catalog = value;
  }
  get catalog(): ICatalog { return this._catalog }

  paginationInfo!: IPager;
  errorReceived: boolean = false;
  searchTerm: string = '';

  constructor(private _route: ActivatedRoute, private _catalogService: CatalogService) { }

  ngOnInit() {
    this._route.paramMap
      .pipe(
        switchMap((params) => {
          this.searchTerm = params.get('searchTerm') ?? '';

          if (this.searchTerm && 2 < this.searchTerm.length) {
            return this._catalogService.searchCatalog(0, 12, this.searchTerm);
          }
          return of(<ICatalog>{});
        })).subscribe((catalog: ICatalog) => {
          this.catalog = catalog;
        });
  }
}
