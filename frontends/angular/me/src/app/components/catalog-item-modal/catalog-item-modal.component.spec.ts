import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogItemModalComponent } from './catalog-item-modal.component';

describe('CatalogItemModalComponent', () => {
  let component: CatalogItemModalComponent;
  let fixture: ComponentFixture<CatalogItemModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogItemModalComponent]
    });
    fixture = TestBed.createComponent(CatalogItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
