import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DetailMetrics, type DetailMetric } from './detail-metrics';

@Component({
  imports: [DetailMetrics],
  template: `<app-detail-metrics [items]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly items: readonly DetailMetric[] = [
    { label: 'Collecté', value: '4 750 000 GNF', hint: '68 % de l’objectif' },
    { label: 'Contributeurs', value: '43', hint: '51 contributions' },
  ];
}

describe('DetailMetrics', () => {
  it('renders ordered metric cells with their labels, values and hints', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('dl > div');
    expect(cells).toHaveLength(2);
    expect(cells[0].textContent).toContain('4 750 000 GNF');
    expect(cells[1].textContent).toContain('51 contributions');
  });
});
