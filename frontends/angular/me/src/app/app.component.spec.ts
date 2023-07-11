import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterOutlet, provideRouter } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-header',
  template: ''
})
class MockHeaderComponent { }

@Component({
  standalone: true,
  selector: 'router-outlet',
  template: ''
})
class MockRouterOutlet {
}

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.overrideComponent(AppComponent, {
      add: {
        imports: [MockHeaderComponent, MockRouterOutlet],
      },
      remove: {
        imports: [HeaderComponent, RouterOutlet],
      },
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'me' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('me');
  });
  
});
