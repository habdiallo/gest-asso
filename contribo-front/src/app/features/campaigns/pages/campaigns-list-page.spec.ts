import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CampagnesService, CampaignStatus } from '@api';
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
  listCampaigns: (
    page: number,
    size?: number,
    q?: string,
    status?: CampaignStatus,
  ) => Observable<CampaignPage>,
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

  it('requests campaigns filtered by status when the status filter changes', async () => {
    const requestedStatuses: (CampaignStatus | undefined)[] = [];
    const fixture = await createFixture((_page, _size, _q, status) => {
      requestedStatuses.push(status);
      return of(buildCampaignPage());
    });
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#campaigns-status-filter',
    );
    select.value = CampaignStatus.Closed;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(requestedStatuses).toEqual([undefined, CampaignStatus.Closed]);
  });

  it('requests the first page again when the status filter changes', async () => {
    const requestedPages: number[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return of(
        buildCampaignPage({ page: { number: page, size: 1, totalElements: 2, totalPages: 2 } }),
      );
    });
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#campaigns-status-filter',
    );
    select.value = CampaignStatus.Open;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(requestedPages).toEqual([0, 1, 0]);
  });

  it('ignores a stale response that resolves after a later filter change', async () => {
    const open$ = new Subject<CampaignPage>();
    const closed$ = new Subject<CampaignPage>();
    const fixture = await createFixture((_page, _size, _q, status) =>
      status === CampaignStatus.Closed ? closed$.asObservable() : open$.asObservable(),
    );
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#campaigns-status-filter',
    );
    select.value = CampaignStatus.Open;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    select.value = CampaignStatus.Closed;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // Regression T-58 (P2) : la réponse OPEN, arrivée après la sélection de
    // CLOSED, ne doit pas remplacer le résultat du filtre sélectionné en dernier.
    closed$.next(
      buildCampaignPage({
        items: [{ ...buildCampaignPage().items[0], status: 'CLOSED' }],
      }),
    );
    fixture.detectChanges();
    open$.next(buildCampaignPage({ items: [{ ...buildCampaignPage().items[0], status: 'OPEN' }] }));
    fixture.detectChanges();

    expect(fixture.componentInstance.statusFilter()).toBe(CampaignStatus.Closed);
    expect(fixture.componentInstance.campaignPage()?.items[0].status).toBe('CLOSED');
  });

  it('requests campaigns filtered by name after the search input is debounced', async () => {
    vi.useFakeTimers();
    try {
      const requestedQueries: (string | undefined)[] = [];
      const fixture = await createFixture((_page, _size, q) => {
        requestedQueries.push(q);
        return of(buildCampaignPage());
      });
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#campaigns-search');
      input.value = 'Solidarité';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // La requête n'est déclenchée qu'après l'amortissement (debounceTime).
      expect(requestedQueries).toEqual([undefined]);

      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      expect(requestedQueries).toEqual([undefined, 'Solidarité']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('requests the first page again once the debounced search query changes', async () => {
    vi.useFakeTimers();
    try {
      const requestedPages: number[] = [];
      const fixture = await createFixture((page) => {
        requestedPages.push(page);
        return of(
          buildCampaignPage({ page: { number: page, size: 1, totalElements: 2, totalPages: 2 } }),
        );
      });
      fixture.detectChanges();

      const nextButton = fixture.nativeElement.querySelectorAll(
        'nav button',
      )[1] as HTMLButtonElement;
      nextButton.click();
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#campaigns-search');
      input.value = 'Solidarité';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      expect(requestedPages).toEqual([0, 1, 0]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not request twice when the debounced search query is unchanged', async () => {
    vi.useFakeTimers();
    try {
      const requestedQueries: (string | undefined)[] = [];
      const fixture = await createFixture((_page, _size, q) => {
        requestedQueries.push(q);
        return of(buildCampaignPage());
      });
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#campaigns-search');
      input.value = '  Solidarité  ';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      // La valeur amortie ('Solidarité', une fois découpée) ne change pas
      // même si l'utilisateur ajoute puis retire des espaces autour, donc
      // aucune requête supplémentaire n'est déclenchée (distinctUntilChanged).
      input.value = 'Solidarité';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      expect(requestedQueries).toEqual([undefined, 'Solidarité']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('still fires the debounced search after a status change loads a different term mid-debounce', async () => {
    vi.useFakeTimers();
    try {
      const requestedCriteria: { q: string | undefined; status: CampaignStatus | undefined }[] =
        [];
      const fixture = await createFixture((_page, _size, q, status) => {
        requestedCriteria.push({ q, status });
        return of(buildCampaignPage());
      });
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#campaigns-search');
      const select: HTMLSelectElement = fixture.nativeElement.querySelector(
        '#campaigns-status-filter',
      );

      // Recherche 'alpha', amortie et chargée.
      input.value = 'alpha';
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      // L'utilisateur saisit 'beta', puis change immédiatement le statut :
      // cela charge 'beta' avant la fin de l'amortissement de la saisie.
      input.value = 'beta';
      input.dispatchEvent(new Event('input'));
      select.value = CampaignStatus.Open;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // L'utilisateur remet 'alpha' avant la fin des 300 ms.
      input.value = 'alpha';
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      // Régression : la dernière requête chargée doit refléter le champ
      // affiché ('alpha'), pas rester sur 'beta' faute de nouvelle requête.
      expect(requestedCriteria).toEqual([
        { q: undefined, status: undefined },
        { q: 'alpha', status: undefined },
        { q: 'beta', status: CampaignStatus.Open },
        { q: 'alpha', status: CampaignStatus.Open },
      ]);
    } finally {
      vi.useRealTimers();
    }
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
