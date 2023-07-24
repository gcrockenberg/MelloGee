import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
import { SecurityService } from 'src/app/services/security/security.service';
import { catchError, throwError } from 'rxjs';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { IPager } from 'src/app/models/utils/pager.model';
import { ICatalogBrand } from 'src/app/models/catalog/catalog-brand.model';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';
import { PagerComponent } from "../../shared/components/pager/pager.component";
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { CatalogItemsComponent } from "../../components/catalog-items/catalog-items.component";
import { CatalogItemModalComponent } from "../../components/catalog-item-modal/catalog-item-modal.component";

@Component({
    selector: 'app-catalog',
    standalone: true,
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss'],
    imports: [CommonModule, PagerComponent, CatalogItemsComponent, CatalogItemModalComponent]
})
export class CatalogComponent implements OnInit {
  authenticated: boolean = false;
  errorReceived: boolean = false;
  catalog: ICatalog = {
    count: 0,
    data: [],
    pageIndex: 0,
    pageSize: 0
  };
  paginationInfo!: IPager;
  brands!: ICatalogBrand[];
  types!: ICatalogType[];
  brandSelected!: number | null;
  typeSelected!: number | null;

  constructor(
    private _catalogService: CatalogService,
    private _configurationService: ConfigurationService,
    private _securityService: SecurityService
  ) {
    this.authenticated = _securityService.IsAuthorized;
  }

  
  ngOnInit(): void {
    // Configuration Settings:
    this.loadData();

    // Subscribe to login and logout observable
    // this.authSubscription = this.securityService.authenticationChallenge$.subscribe(res => {
    //     this.authenticated = res;
    // });
  }


  loadData() {
    this.getBrands();
    this.getCatalog(12, 0);
    this.getTypes();
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
      let alltypes: ICatalogType = { id: null, type: 'All' };
      this.types.unshift(alltypes);
    });
  }


  getCatalog(pageSize: number, pageIndex: number, brand?: number, type?: number) {
    this.errorReceived = false;
    this._catalogService.getCatalog(pageIndex, pageSize, brand, type)
      .pipe(catchError((err) => this._handleError(err)))
      .subscribe(catalog => {
        this.catalog = catalog;
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
    console.log('catalog pager event fired' + value);
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
