import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CampagnesService, CurrencyCode } from '@api';
import type { Campaign } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { CampaignDetailPage } from './campaign-detail-page';

function buildCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
    name: 'Solidarité septembre',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'OPEN',
    memberCount: 86,
    description: 'Campagne générale de soutien.',
    categoryAmounts: [
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        amount: 100_000,
        memberCount: 60,
        expectedAmount: 6_000_000,
        currency: CurrencyCode.Gnf,
      },
    ],
    ...overrides,
  };
}

async function createFixture(
  getCampaign: (campaignId: string) => Observable<Campaign>,
  campaignId = 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
): Promise<ComponentFixture<CampaignDetailPage>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignDetailPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      {
        provide: CampagnesService,
        useValue: {
          getCampaign,
          listCampaignDues: () =>
            of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
        } as unknown as CampagnesService,
      },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ campaignId }) } },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CampaignDetailPage);
  fixture.detectChanges();
  return fixture;
}

describe('CampaignDetailPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<Campaign>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement de la campagne',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la campagne',
    );
  });

  it('renders campaign name, period, status and description', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('1 septembre 2026');
    expect(root.textContent).toContain('30 septembre 2026');
    expect(root.textContent).toContain('Campagne générale de soutien.');
  });

  it('renders three tabs with the bareme tab active by default', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(['Barème', 'Cotisations', 'Bilan']);

    const baremeTab = tabs[0];
    expect(baremeTab.getAttribute('aria-selected')).toBe('true');
    expect(baremeTab.tabIndex).toBe(0);
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, 0, 0]);

    expect(root.querySelector('#campaign-tabpanel-bareme')).not.toBeNull();
    expect(root.querySelector('#campaign-tabpanel-cotisations')).toBeNull();
    expect(root.textContent).toContain('Standard');
    expect(root.textContent).toContain(formatGnfAmountDetailed(100_000));
  });

  it('switches to the cotisations tab without a full page reload', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    tabs[1].click();
    fixture.detectChanges();

    expect(root.querySelector('#campaign-tabpanel-bareme')).toBeNull();
    const cotisationsPanel = root.querySelector('#campaign-tabpanel-cotisations');
    expect(cotisationsPanel).not.toBeNull();
    expect(cotisationsPanel?.textContent).toContain('Aucune cotisation pour cette campagne.');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, 0, 0]);
  });

  it('switches to the bilan tab', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    tabs[2].click();
    fixture.detectChanges();

    const bilanPanel = root.querySelector('#campaign-tabpanel-bilan');
    expect(bilanPanel).not.toBeNull();
    expect(bilanPanel?.textContent).toContain(
      'Le bilan de la campagne sera disponible prochainement.',
    );
  });

  it('shows the empty bareme message when there is no category amount', async () => {
    const fixture = await createFixture(() => of(buildCampaign({ categoryAmounts: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Aucune catégorie de revenu dans le barème.',
    );
  });
});
