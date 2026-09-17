import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CagnottesService } from '@api';
import type { SocialFundPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { SocialFundsListPage } from './social-funds-list-page';

function buildSocialFundPage(overrides: Partial<SocialFundPage> = {}): SocialFundPage {
  return {
    items: [
      {
        id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
        title: 'Mariage de Fanta et Sékou',
        eventType: 'WEDDING',
        beneficiary: 'Famille Camara',
        startDate: '2026-09-05',
        endDate: '2026-09-28',
        status: 'OPEN',
        targetAmount: 7000000,
        collectedAmount: 4750000,
        remainingToTargetAmount: 2250000,
        progressRate: 67.9,
        contributorCount: 43,
        contributionCount: 51,
        currency: 'GNF',
      },
    ],
    page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    ...overrides,
  };
}

type ListSocialFunds = (page?: number, size?: number) => Observable<SocialFundPage>;

async function createFixture(
  listSocialFunds: ListSocialFunds,
): Promise<ComponentFixture<SocialFundsListPage>> {
  await TestBed.configureTestingModule({
    imports: [
      SocialFundsListPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: CagnottesService,
        useValue: { listSocialFunds } as unknown as CagnottesService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SocialFundsListPage);
  fixture.detectChanges();
  return fixture;
}

describe('SocialFundsListPage', () => {
  it('preserves focus while the next page loads and prevents repeated requests', async () => {
    const pending = new Subject<SocialFundPage>();
    const requestedPages: (number | undefined)[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return page === 0
        ? of(
            buildSocialFundPage({
              page: { number: 0, size: 20, totalElements: 21, totalPages: 2 },
            }),
          )
        : pending.asObservable();
    });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const nextButton = root.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.focus();
    nextButton.click();
    fixture.detectChanges();

    expect(nextButton.isConnected).toBe(true);
    expect(nextButton.disabled).toBe(false);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(nextButton);
    nextButton.click();
    fixture.componentInstance.goToPreviousPage();
    expect(requestedPages).toEqual([0, 1]);

    pending.next(
      buildSocialFundPage({ page: { number: 1, size: 20, totalElements: 21, totalPages: 2 } }),
    );
    pending.complete();
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
    expect(root.textContent).toContain('Page 2 sur 2');
  });

  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<SocialFundPage>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des cagnottes',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les cagnottes',
    );
  });

  it('renders the social funds returned by the API with their progress bar', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Mariage de Fanta et Sékou');
    expect(root.textContent).toContain('Mariage');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('Famille Camara');
    expect(root.textContent).toContain('43 contributeur(s)');

    const progressBar = root.querySelector<HTMLElement>('.bg-gold');
    expect(progressBar?.style.width).toBe('67.9%');
  });

  it('shows the condensed GNF amounts with the full detailed value as a tooltip (RG-FMT-003)', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('4,8M GNF');
    expect(root.textContent).toContain('7M GNF');
    // La valeur détaillée reste disponible au survol et aux lecteurs d'écran.
    expect(root.querySelector('[title] [aria-hidden="true"]')?.textContent).toBe('4,8M GNF');
    expect(root.querySelector('[title] .sr-only')?.textContent).toBe('4 750 000 GNF');

    const amountSpans = Array.from(root.querySelectorAll<HTMLElement>('[title]')).filter((el) =>
      (el.getAttribute('title') ?? '').includes('GNF'),
    );
    expect(amountSpans.some((el) => el.getAttribute('title') === '4 750 000 GNF')).toBe(true);
    expect(amountSpans.some((el) => el.getAttribute('title') === '7 000 000 GNF')).toBe(true);
  });

  it('hides the progress bar when no target amount is defined', async () => {
    const fixture = await createFixture(() =>
      of(
        buildSocialFundPage({
          items: [
            {
              id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
              title: 'Soutien à la famille Diallo',
              eventType: 'DEATH',
              beneficiary: 'Famille Diallo',
              startDate: '2026-08-10',
              endDate: '2026-09-10',
              status: 'CLOSED',
              collectedAmount: 1850000,
              contributorCount: 22,
              contributionCount: 26,
              currency: 'GNF',
            },
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('1,9M GNF');
    expect(root.querySelector('.bg-gold')).toBeNull();
  });

  it('shows the empty-list message when there is no social fund', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage({ items: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune cagnotte pour le moment.');
  });

  describe('pagination', () => {
    function buildManyItems(count: number): SocialFundPage['items'] {
      return Array.from({ length: count }, (_, index) => ({
        id: `c0000000-0000-4000-8000-${index.toString().padStart(12, '0')}`,
        title: `Cagnotte ${index + 1}`,
        eventType: 'BIRTH',
        beneficiary: 'Famille Test',
        startDate: '2026-09-05',
        endDate: '2026-09-28',
        status: 'OPEN',
        collectedAmount: 10_000,
        contributorCount: 1,
        contributionCount: 1,
        currency: 'GNF',
      }));
    }

    it('does not show pagination controls when a single page is returned', async () => {
      const fixture = await createFixture(() => of(buildSocialFundPage()));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('nav[aria-label]')).toBeNull();
    });

    it('shows pagination controls and requests the next page beyond 20 social funds', async () => {
      const listSocialFunds = vi.fn((page = 0) =>
        of(
          buildSocialFundPage({
            items: page === 0 ? buildManyItems(20) : buildManyItems(5),
            page: { number: page, size: 20, totalElements: 25, totalPages: 2 },
          }),
        ),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Page 1 sur 2');

      const previousButton = root.querySelectorAll<HTMLButtonElement>('button')[0];
      const nextButton = root.querySelectorAll<HTMLButtonElement>('button')[1];
      expect(previousButton.getAttribute('aria-disabled')).toBe('true');
      expect(nextButton.getAttribute('aria-disabled')).toBeNull();

      nextButton.click();
      fixture.detectChanges();

      expect(listSocialFunds).toHaveBeenCalledWith(1, 20);
      expect(root.textContent).toContain('Page 2 sur 2');
      expect(previousButton.getAttribute('aria-disabled')).toBeNull();
      expect(nextButton.getAttribute('aria-disabled')).toBe('true');

      previousButton.click();
      fixture.detectChanges();

      expect(listSocialFunds).toHaveBeenCalledWith(0, 20);
      expect(root.textContent).toContain('Page 1 sur 2');
    });

    it('keeps the currently displayed page when a page change request fails', async () => {
      const listSocialFunds = vi.fn((page = 0) =>
        page === 0
          ? of(
              buildSocialFundPage({
                items: buildManyItems(20),
                page: { number: 0, size: 20, totalElements: 25, totalPages: 2 },
              }),
            )
          : throwError(() => new Error('network error')),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const nextButton = root.querySelectorAll<HTMLButtonElement>('button')[1];
      nextButton.click();
      fixture.detectChanges();

      expect(root.textContent).toContain('Page 1 sur 2');
      expect(root.querySelector('[role="alert"]')).not.toBeNull();
    });
  });
});
