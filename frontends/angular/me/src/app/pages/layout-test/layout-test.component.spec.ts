import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutTestComponent } from './layout-test.component';

describe('LayoutTestComponent', () => {
  let component: LayoutTestComponent;
  let fixture: ComponentFixture<LayoutTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LayoutTestComponent]
    });
    fixture = TestBed.createComponent(LayoutTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
