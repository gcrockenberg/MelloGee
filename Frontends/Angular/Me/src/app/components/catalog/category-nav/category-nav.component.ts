import { Component, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.scss']
})
export class CategoryNavComponent {
  readonly catalogTypes: WritableSignal<ICatalogType[]> = signal([]);

  constructor(private _catalogservice: CatalogService) {
    _catalogservice.getTypes().subscribe(catalogTypes => this.catalogTypes.set(catalogTypes));
  }

}
