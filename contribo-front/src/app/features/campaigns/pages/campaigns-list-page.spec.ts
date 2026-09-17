import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CampagnesService } from '@api';
import type { CampaignPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { CampaignsListPage } from './campaigns-list-page';

function buildCampaignPage(overrides: Partial<CampaignPage> = {}): CampaignPage {
  return {
    items: [
      {
        id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: 'OPEN',
        memberCount: 86,
      },
    ],
    page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    ...overrides,
  };
}

async function createFixture(
  listCampaigns: () => Observable<CampaignPage>,
): Promise<ComponentFixture<CampaignsListPage>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignsListPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: CampagnesService,
        useValue: { listCampaigns } as unknown as CampagnesService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CampaignsListPage);
  fixture.detectChanges();
  return fixture;
}

describe('CampaignsListPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<CampaignPage>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des campagnes',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les campagnes',
    );
  });

  it('renders campaign name, period and status', async () => {
    const fixture = await createFixture(() => of(buildCampaignPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('1 septembre 2026');
    expect(root.textContent).toContain('30 septembre 2026');
  });

  it('shows the empty-list message when there is no campaign', async () => {
    const fixture = await createFixture(() =>
      of(
        buildCampaignPage({
          items: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 1 },
        }),
      ),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune campagne.');
  });

  it('disables the previous page control on the first page and enables the next one', async () => {
    const fixture = await createFixture(() =>
      of(buildCampaignPage({ page: { number: 0, size: 1, totalElements: 2, totalPages: 2 } })),
    );
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const previousButton = buttons[0] as HTMLButtonElement;
    const nextButton = buttons[1] as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);
  });
});
