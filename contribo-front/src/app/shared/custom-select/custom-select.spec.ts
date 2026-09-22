import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CustomSelect } from './custom-select';

@Component({
  imports: [CustomSelect],
  template: `<app-custom-select
    [options]="options"
    [(value)]="value"
    ariaLabel="Campagne de cotisation"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly options = [
    { value: 'a', label: 'Campagne A' },
    { value: 'b', label: 'Campagne B' },
    { value: 'c', label: 'Campagne C' },
  ];
  readonly value = signal('a');
}

describe('CustomSelect', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function trigger(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('[data-select-trigger]')).nativeElement;
  }

  function listbox(): HTMLElement | null {
    return fixture.nativeElement.querySelector('[role="listbox"]');
  }

  it('affiche le libellé de la valeur sélectionnée sans ouvrir le menu', () => {
    expect(trigger().textContent).toContain('Campagne A');
    expect(listbox()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('ouvre le menu au clic sur le déclencheur', () => {
    trigger().click();
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('sélectionne une option au clic et referme le menu', () => {
    trigger().click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    (options[2] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('c');
    expect(listbox()).toBeNull();
    expect(trigger().textContent).toContain('Campagne C');
  });

  it('ferme le menu et restitue le focus au déclencheur avec Échap', () => {
    trigger().click();
    fixture.detectChanges();

    const firstOption = fixture.nativeElement.querySelector('[role="option"]') as HTMLButtonElement;
    firstOption.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('ferme le menu au clic en dehors du composant', () => {
    trigger().click();
    fixture.detectChanges();
    expect(listbox()).not.toBeNull();

    document.body.click();
    fixture.detectChanges();

    expect(listbox()).toBeNull();
  });
});
