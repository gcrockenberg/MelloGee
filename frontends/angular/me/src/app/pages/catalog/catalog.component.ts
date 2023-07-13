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

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  authenticated: boolean = false;
  errorReceived: boolean = false;
  catalog!: ICatalog;
  paginationInfo!: IPager;
  brands!: ICatalogBrand[];
  types!: ICatalogType[];

  constructor(
    private _catalogService: CatalogService,
    private _configurationService: ConfigurationService,
    private _securityService: SecurityService
  ) {
    this.authenticated = _securityService.IsAuthorized;
  }

  ngOnInit(): void {
    // Configuration Settings:
    if (this._configurationService.isReady)
      this.loadData();
    else
      this._configurationService.settingsLoaded$.subscribe(x => {
        this.loadData();
      });

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
        console.log("--> loaded brands: ", this.brands);
      },
      error: (error) => this._handleError(error)
    });
  }


  getTypes() {
    this._catalogService.getTypes().subscribe(types => {
      this.types = types;
      let alltypes: ICatalogType = { id: null, type: 'All' };
      this.types.unshift(alltypes);
      console.log("--> loaded types: ", this.types);
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
        console.log("--> loaded tems: ", this.paginationInfo.items);
      });
  }


  private _handleError(error: any) {
    this.errorReceived = true;
    return throwError(() => error);
  }

}
