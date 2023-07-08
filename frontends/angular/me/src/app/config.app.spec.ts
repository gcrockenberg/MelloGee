import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { appConfig } from './config.app';
import { RouterTestingModule } from '@angular/router/testing';

describe('Ensure that the app starts', () => {
  it('should boot the app', () => {
    const bootApplication = () => {
      const { router, run } = setup();

      run(() => router.initialNavigation());
    };

    expect(bootApplication).not.toThrow();
  });

  it('should navigate to unguarded route', async () => {
    const { router, run } = setup();

    const canNavigate = await run(() => router.navigateByUrl('/'));

    expect(canNavigate).toBe(true);
  });

  it('should not navigate to guarded component', async () => {
    const { router, run } = setup();

    const canNavigate = await run(() => router.navigateByUrl('/secure'));

    expect(canNavigate).toBe(false);
  });
});

function setup() {
  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: appConfig.providers,
  }).compileComponents();

  let rootFixture: ComponentFixture<AppComponent>;

  const initializeRootFixture = () => {
    if (rootFixture == null) {
      rootFixture = TestBed.createComponent(AppComponent);
    }
  };

  return {
    get router() {
      initializeRootFixture();
      return TestBed.inject(Router);
    },
    run<TResult>(task: () => TResult) {
      initializeRootFixture();
      return rootFixture.ngZone == null ? task() : rootFixture.ngZone.run(task);
    },
    fixture: TestBed.createComponent(AppComponent),
  };
}
