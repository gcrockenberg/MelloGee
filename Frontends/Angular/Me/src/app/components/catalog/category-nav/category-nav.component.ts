import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { RouterLink } from '@angular/router';
import { ICatalogType } from 'src/app/models/catalog.model';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.scss']
})
export class CategoryNavComponent {
  readonly catalogTypes: WritableSignal<ICatalogType[]> = signal([]);
  @Input() enableScrollToTop: boolean = false;

  constructor(private _catalogservice: CatalogService) {
    _catalogservice.getTypes().subscribe(catalogTypes => this.catalogTypes.set(catalogTypes));
  }


  scrollToTop() {
    if (this.enableScrollToTop) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }


}
