import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CampaignStatus, CurrencyCode, DueStatus, EspacePersonnelService } from '@api';
import type { DuePage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { MyDues } from './my-dues';

const result: DuePage = {
  items: [
    {
      id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      member: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Mariama Diallo' },
      campaign: {
        id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: CampaignStatus.Open,
      },
      incomeCategorySnapshot: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Standard' },
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
  ],
  page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
};

async function createFixture(
  listMyDues: () => Observable<DuePage> = () => of(result),
): Promise<ComponentFixture<MyDues>> {
  await TestBed.configureTestingModule({
    imports: [
      MyDues,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [{ provide: EspacePersonnelService, useValue: { listMyDues } }],
  }).compileComponents();

  const fixture = TestBed.createComponent(MyDues);
  fixture.detectChanges();
  return fixture;
}

describe('MyDues', () => {
  it('renders the connected member dues', async () => {
    const fixture = await createFixture();
    expect(fixture.nativeElement.textContent).toContain('Solidarité septembre');
    expect(fixture.nativeElement.textContent).toContain('Partiellement payé');
  });

  it('clears the previous result when a subsequent page fails', async () => {
    let calls = 0;
    const fixture = await createFixture(() => {
      calls += 1;
      return calls === 1 ? of(result) : throwError(() => new Error('network error'));
    });
    fixture.componentInstance.loadPage(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Solidarité septembre');
  });
});
