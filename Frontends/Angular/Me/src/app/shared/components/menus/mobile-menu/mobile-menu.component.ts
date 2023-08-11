import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapXLg } from '@ng-icons/bootstrap-icons';
import { ICatalogType } from 'src/app/models/catalog/catalog-type.model';
import { CatalogService } from 'src/app/services/catalog/catalog.service';


@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterLink, RouterLinkActive],
  providers: [provideIcons({ bootstrapXLg })],
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss']
})
export class MobileMenuComponent {
  @Input() visible: boolean = false;
  readonly catalogTypes: WritableSignal<ICatalogType[]> = signal([]);


  constructor(private _catalogservice: CatalogService) {
    _catalogservice.getTypes().subscribe(catalogTypes => this.catalogTypes.set(catalogTypes));
  }

  
  closeMenu() {
    this.visible = false;
  }
}
