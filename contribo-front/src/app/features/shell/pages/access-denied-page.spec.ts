import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AccessDeniedPage } from './access-denied-page';

describe('AccessDeniedPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AccessDeniedPage],
      providers: [provideRouter([])],
    });
  });

  it('shows a generic access-denied message and a link back home', () => {
    const fixture = TestBed.createComponent(AccessDeniedPage);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1')?.textContent).toContain('Accès refusé');
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
