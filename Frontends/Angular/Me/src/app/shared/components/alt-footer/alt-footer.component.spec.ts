import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltFooterComponent } from './alt-footer.component';

describe('AltFooterComponent', () => {
  let component: AltFooterComponent;
  let fixture: ComponentFixture<AltFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AltFooterComponent]
    });
    fixture = TestBed.createComponent(AltFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
