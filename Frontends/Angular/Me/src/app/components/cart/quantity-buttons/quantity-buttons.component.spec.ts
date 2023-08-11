import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityButtonsComponent } from './quantity-buttons.component';

describe('QuantityButtonsComponent', () => {
  let component: QuantityButtonsComponent;
  let fixture: ComponentFixture<QuantityButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuantityButtonsComponent]
    });
    fixture = TestBed.createComponent(QuantityButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
