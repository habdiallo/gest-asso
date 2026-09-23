import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ActionButton } from './action-button';

@Component({
  imports: [ActionButton],
  template: `
    <app-action-button
      [routerLink]="['/campagnes']"
      [queryParams]="{ creer: '1' }"
      ariaLabel="Nouvelle campagne"
    >
      <span>Nouvelle campagne</span>
    </app-action-button>
    <app-action-button type="button" [disabled]="true">
      <span>Annuler</span>
    </app-action-button>
    <app-action-button type="submit" variant="secondary" [loading]="true">
      <span>Enregistrer</span>
    </app-action-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('ActionButton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders navigation actions as links and preserves query parameters', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/campagnes?creer=1');
    expect(links[0].textContent).toContain('Nouvelle campagne');
    expect(links[0].getAttribute('aria-label')).toBe('Nouvelle campagne');
    expect(links[0].classList.contains('min-h-11')).toBe(true);
  });

  it('renders local actions as native buttons with explicit types and disabled state', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.map((button) => button.type)).toEqual(['button', 'submit']);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[0].textContent).toContain('Annuler');
    expect(buttons[1].classList.contains('border')).toBe(true);
  });

  it('exposes loading as an accessible busy state and disables the action', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons[1].getAttribute('aria-busy')).toBe('true');
    expect(buttons[1].disabled).toBe(true);
  });
});
