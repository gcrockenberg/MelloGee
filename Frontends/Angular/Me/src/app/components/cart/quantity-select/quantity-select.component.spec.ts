import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantitySelectComponent } from './quantity-select.component';

describe('QuantitySelectComponent', () => {
  let component: QuantitySelectComponent;
  let fixture: ComponentFixture<QuantitySelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuantitySelectComponent]
    });
    fixture = TestBed.createComponent(QuantitySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
