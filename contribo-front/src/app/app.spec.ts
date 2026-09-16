import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('loads the home feature at the root route', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Contribo');
    expect(harness.routeNativeElement?.querySelector('main')).toBeTruthy();
  });

  it('redirects an unknown route to the home feature', async () => {
    const harness = await RouterTestingHarness.create('/unknown');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Contribo');
  });
});
