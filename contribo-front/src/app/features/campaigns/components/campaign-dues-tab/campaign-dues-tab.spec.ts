import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CampagnesService, CampaignStatus, CurrencyCode, DueStatus } from '@api';
import type { DuePage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { CampaignDuesTab } from './campaign-dues-tab';

const result: DuePage = {
  items: [
    {
      id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      member: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Amadou Diallo' },
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
  listCampaignDues: (
    campaignId: string,
    page?: number,
    size?: number,
    q?: string,
    status?: DueStatus,
  ) => Observable<DuePage> = () => of(result),
): Promise<ComponentFixture<CampaignDuesTab>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignDuesTab,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [{ provide: CampagnesService, useValue: { listCampaignDues } }],
  }).compileComponents();

  const fixture = TestBed.createComponent(CampaignDuesTab);
  fixture.componentRef.setInput('campaignId', result.items[0].campaign.id);
  fixture.detectChanges();
  return fixture;
}

function getStatusFilterSelect(root: HTMLElement): HTMLSelectElement {
  const select = root.querySelector<HTMLSelectElement>('#campaign-dues-status-filter');
  if (!select) {
    throw new Error('Le sélecteur de statut est introuvable.');
  }
  return select;
}

describe('CampaignDuesTab', () => {
  it('loads and renders campaign dues', async () => {
    const fixture = await createFixture();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.textContent).toContain('Partiellement payé');
  });

  it('shows a retry state when loading fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les cotisations.',
    );
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Réessayer');
  });

  it('reloads with the selected status filter and resets to the first page', async () => {
    const listCampaignDues = vi.fn(() => of(result));
    const fixture = await createFixture(listCampaignDues);
    const root: HTMLElement = fixture.nativeElement;

    listCampaignDues.mockClear();
    const select = getStatusFilterSelect(root);

    select.value = DueStatus.Paid;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(listCampaignDues).toHaveBeenCalledWith(
      result.items[0].campaign.id,
      0,
      undefined,
      undefined,
      DueStatus.Paid,
    );
  });

  it('ignores a stale response received after a newer filter was applied', async () => {
    const initial$ = new Subject<DuePage>();
    const filtered$ = new Subject<DuePage>();
    let callCount = 0;
    const listCampaignDues = vi.fn(() => {
      callCount += 1;
      return callCount === 1 ? initial$.asObservable() : filtered$.asObservable();
    });
    const fixture = await createFixture(listCampaignDues);
    const root: HTMLElement = fixture.nativeElement;

    // Chargement initial encore en attente lorsque l'utilisateur choisit PAID.
    const select = getStatusFilterSelect(root);
    select.value = DueStatus.Paid;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const paidResult: DuePage = {
      items: [{ ...result.items[0], status: DueStatus.Paid, remainingAmount: 0 }],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };
    filtered$.next(paidResult);
    filtered$.complete();
    fixture.detectChanges();

    // Réponse tardive du chargement initial (statut DUE) : ne doit pas écraser le filtre courant.
    initial$.next(result);
    initial$.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.duePage()?.items[0].status).toBe(DueStatus.Paid);
  });
});
