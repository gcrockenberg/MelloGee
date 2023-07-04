import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMyDataComponent } from './delete-my-data.component';

describe('DeleteMyDataComponent', () => {
  let component: DeleteMyDataComponent;
  let fixture: ComponentFixture<DeleteMyDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeleteMyDataComponent]
    });
    fixture = TestBed.createComponent(DeleteMyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
