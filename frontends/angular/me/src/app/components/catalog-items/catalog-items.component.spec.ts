import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogItemsComponent } from './catalog-items.component';

describe('CatalogItemsComponent', () => {
  let component: CatalogItemsComponent;
  let fixture: ComponentFixture<CatalogItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogItemsComponent]
    });
    fixture = TestBed.createComponent(CatalogItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
