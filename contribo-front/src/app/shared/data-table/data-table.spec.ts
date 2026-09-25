import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTable } from './data-table';

@Component({
  imports: [DataTable],
  template: `
    <app-data-table caption="Situation des membres" [busy]="true">
      <thead>
        <tr>
          <th>Membre</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Amadou Diallo</td>
        </tr>
      </tbody>
    </app-data-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('DataTable', () => {
  it('renders projected table content and announces pending work', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(table.caption?.textContent).toContain('Situation des membres');
    expect(table.querySelector('tbody td')?.textContent).toContain('Amadou Diallo');
    expect(table.parentElement?.getAttribute('aria-busy')).toBe('true');
    expect(table.className).toContain('min-w-[760px]');
  });
});
