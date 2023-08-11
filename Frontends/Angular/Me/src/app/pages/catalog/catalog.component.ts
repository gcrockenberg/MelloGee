import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { catchError, throwError } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { IPager } from 'src/app/models/utils/pager.model';
import { ICatalogBrand } from 'src/app/models/catalog/catalog-brand.model';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';
import { PagerComponent } from "../../shared/components/tools/pager/pager.component";
import { CatalogItemModalComponent } from "../../components/catalog/catalog-item-modal/catalog-item-modal.component";
import { LatestProductsComponent } from "../../components/catalog/latest-products/latest-products.component";
import { HeroComponent } from "../../components/hero/hero/hero.component";

@Component({
    selector: 'app-catalog',
    standalone: true,
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss'],
    imports: [CommonModule, PagerComponent, CatalogItemModalComponent, LatestProductsComponent, HeroComponent]
})
export class CatalogComponent implements OnInit {
  errorReceived: boolean = false;
  readonly catalog: WritableSignal<ICatalog> = signal(<ICatalog>{});
  paginationInfo!: IPager;
  brands: ICatalogBrand[] = [];
  types: ICatalogType[] = [];
  brandSelected!: number | null;
  typeSelected!: number | null;

  constructor(private _catalogService: CatalogService) { }

  
  ngOnInit(): void {
    this.getCatalog(12, 0);
  }


  getBrands() {
    this._catalogService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        let allBrands: ICatalogBrand = { id: null, brand: 'All' };
        this.brands.unshift(allBrands);
      },
      error: (error) => this._handleError(error)
    });
  }


  getTypes() {
    this._catalogService.getTypes().subscribe(types => {
      this.types = types;
      let alltypes: ICatalogType = { id: -1, type: 'All' };
      this.types.unshift(alltypes);
    });
  }


  getCatalog(pageSize: number, pageIndex: number, brand?: number, type?: number) {
    this.errorReceived = false;
    this._catalogService.getCatalog(pageIndex, pageSize, brand, type)
      .pipe(catchError((err) => this._handleError(err)))
      .subscribe(catalog => {
        this.catalog.set(catalog);
        this.paginationInfo = {
          actualPage: catalog.pageIndex,
          itemsPage: catalog.pageSize,
          totalItems: catalog.count,
          totalPages: Math.ceil(catalog.count / catalog.pageSize),
          items: catalog.pageSize
        };
      });
  }
  

  onBrandFilterChanged(event: any) {
    event.preventDefault();
    this.brandSelected = event.target.value;
  }


  onFilterApplied(event: any) {
    event.preventDefault();

    this.brandSelected = this.brandSelected && this.brandSelected.toString() != "null" ? this.brandSelected : null;
    this.typeSelected = this.typeSelected && this.typeSelected.toString() != "null" ? this.typeSelected : null;
    this.paginationInfo.actualPage = 0;
    this.getCatalog(this.paginationInfo.itemsPage, this.paginationInfo.actualPage, this.brandSelected!, this.typeSelected!);
  }


  onPageChanged(value: any) {
    //    event.preventDefault();
    this.paginationInfo.actualPage = value;
    this.getCatalog(this.paginationInfo.itemsPage, value);
  }


  onTypeFilterChanged(event: any) {
    event.preventDefault();
    this.typeSelected = event.target.value;
  }


  private _handleError(error: any) {
    this.errorReceived = true;
    return throwError(() => error);
  }

}
