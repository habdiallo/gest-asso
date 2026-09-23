import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

@Component({
  imports: [PageHeader],
  template: `
    <app-page-header kicker="Répertoire" title="Membres" intro="86 membres actifs.">
      <button type="button">Ajouter</button>
    </app-page-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('PageHeader', () => {
  it('renders the prototype page-head hierarchy and projected actions', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('header')).toBeTruthy();
    expect(root.querySelector('header p')?.textContent?.trim()).toBe('Répertoire');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Membres');
    expect(root.querySelector('header > div > p:last-child')?.textContent?.trim()).toBe(
      '86 membres actifs.',
    );
    expect(root.querySelector('button')?.textContent?.trim()).toBe('Ajouter');
  });
});
