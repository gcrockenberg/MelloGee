import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterListTitleComponent } from './footer-list-title.component';

describe('FooterListTitleComponent', () => {
  let component: FooterListTitleComponent;
  let fixture: ComponentFixture<FooterListTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FooterListTitleComponent]
    });
    fixture = TestBed.createComponent(FooterListTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
