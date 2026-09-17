import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
  listCampaigns: (page: number) => Observable<CampaignPage>,
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
      provideRouter([]),
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

    expect(previousButton.getAttribute('aria-disabled')).toBe('true');
    expect(nextButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('keeps the pagination controls mounted and preserves keyboard focus while changing page', async () => {
    const page0$ = new Subject<CampaignPage>();
    const page1$ = new Subject<CampaignPage>();
    const requestedPages: number[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return page === 0 ? page0$.asObservable() : page1$.asObservable();
    });
    page0$.next(buildCampaignPage({ page: pageMeta(0) }));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const nextButton = root.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.focus();
    expect(document.activeElement).toBe(nextButton);

    nextButton.click();
    fixture.detectChanges();

    // Regression T-57 (P3) : la commande de pagination reste montée et gardait
    // le focus clavier pendant le chargement de la page suivante, au lieu
    // d'être démontée puis recréée sans restitution du focus (`document.activeElement`
    // devenait BODY), cf. `.claude/rules/frontend/accessibilite.md`.
    expect(root.querySelector('nav')).not.toBeNull();
    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');

    page1$.next(buildCampaignPage({ page: pageMeta(1) }));
    fixture.detectChanges();

    expect(requestedPages).toEqual([0, 1]);
    const nextButtonAfterLoad = root.querySelectorAll('nav button')[1] as HTMLButtonElement;
    expect(document.activeElement).toBe(nextButtonAfterLoad);
    expect(document.activeElement).not.toBe(document.body);
  });
});

function pageMeta(number: number): CampaignPage['page'] {
  return { number, size: 1, totalElements: 2, totalPages: 2 };
}
