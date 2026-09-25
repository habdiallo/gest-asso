import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ActionButton } from '../action-button/action-button';
import { DetailMetrics, type DetailMetric } from '../detail-metrics/detail-metrics';
import { DetailShell } from './detail-shell';

@Component({
  imports: [ActionButton, DetailMetrics, DetailShell],
  template: `
    <app-detail-shell
      backRouterLink="/campagnes"
      backLabel="Retour aux campagnes"
      kicker="Campagne ouverte"
      title="Solidarité septembre"
      intro="Du 1er au 30 septembre 2026"
    >
      <app-action-button detail-actions ariaLabel="Enregistrer">Enregistrer</app-action-button>
      <app-detail-metrics detail-metrics [items]="metrics" />
      <p detail-tabs>Onglets</p>
      <p>Contenu</p>
    </app-detail-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly metrics: readonly DetailMetric[] = [
    { label: 'Total attendu', value: '18 500 000 GNF', hint: '86 membres' },
  ];
}

describe('DetailShell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders the prototype hierarchy and projected sections', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('main')?.className).toContain('max-w-[1440px]');
    expect(root.querySelector('a')?.textContent).toContain('Retour aux campagnes');
    expect(root.querySelector('h1')?.textContent).toContain('Solidarité septembre');
    expect(root.querySelector('app-detail-metrics')).toBeTruthy();
    expect(root.querySelector('[detail-tabs]')?.textContent).toContain('Onglets');
    expect(root.querySelector('button')?.textContent).toContain('Enregistrer');
  });
});
