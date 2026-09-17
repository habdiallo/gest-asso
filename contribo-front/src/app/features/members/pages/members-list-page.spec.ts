import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MembresService } from '@api';
import type { MemberPage, MemberSummary } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { MembersListPage } from './members-list-page';

function buildMember(overrides: Partial<MemberSummary> = {}): MemberSummary {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    firstName: 'Amadou',
    lastName: 'Diallo',
    preferredName: 'Bah',
    displayName: 'Amadou Diallo',
    country: 'Guinée',
    city: 'Conakry',
    phone: '+224 622 12 34 56',
    incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie B' },
    associationFunction: 'Président',
    status: 'ACTIVE',
    ...overrides,
  };
}

function buildMemberPage(overrides: Partial<MemberPage> = {}): MemberPage {
  return {
    items: [buildMember()],
    summary: { total: 91, active: 86, inactive: 5 },
    page: { number: 0, size: 20, totalElements: 91, totalPages: 5 },
    ...overrides,
  };
}

async function createFixture(
  listMembers: (page?: number) => Observable<MemberPage>,
): Promise<ComponentFixture<MembersListPage>> {
  await TestBed.configureTestingModule({
    imports: [
      MembersListPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      { provide: MembresService, useValue: { listMembers } as unknown as MembresService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MembersListPage);
  fixture.detectChanges();
  return fixture;
}

describe('MembersListPage', () => {
  it('keeps focus during pagination, blocks repeat requests and preserves the page on failure', async () => {
    const pending = new Subject<MemberPage>();
    const requestedPages: (number | undefined)[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return page === 0 ? of(buildMemberPage()) : pending.asObservable();
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

    pending.error(new Error('network error'));
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(root.textContent).toContain('Amadou');
    expect(root.querySelector('[role="alert"]')).toBeTruthy();
    expect(nextButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('keeps the focused next button when the last page arrives', async () => {
    const pending = new Subject<MemberPage>();
    const fixture = await createFixture((page) =>
      page === 0
        ? of(buildMemberPage({ page: { number: 0, size: 20, totalElements: 21, totalPages: 2 } }))
        : pending.asObservable(),
    );
    fixture.detectChanges();
    const nextButton = fixture.nativeElement.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.focus();
    nextButton.click();
    fixture.detectChanges();
    pending.next(
      buildMemberPage({ page: { number: 1, size: 20, totalElements: 21, totalPages: 2 } }),
    );
    pending.complete();
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.disabled).toBe(false);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<MemberPage>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Chargement des membres');
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la liste des membres',
    );
  });

  it('shows the empty-list message when no member is registered', async () => {
    const fixture = await createFixture(() => of(buildMemberPage({ items: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun membre enregistré.');
  });

  it('renders the member table with the columns required by US-MEM-002', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const row = root.querySelector('tbody tr');
    expect(row?.textContent).toContain('Diallo');
    expect(row?.textContent).toContain('Amadou');
    expect(row?.textContent).toContain('Bah');
    expect(row?.textContent).toContain('Guinée');
    expect(row?.textContent).toContain('Conakry');
    expect(row?.textContent).toContain('+224 622 12 34 56');
    expect(row?.textContent).toContain('Catégorie B');
    expect(row?.textContent).toContain('Président');
    expect(row?.textContent).toContain('Actif');
    expect(root.textContent).toContain('86 membre(s) actif(s) sur 91 membre(s) enregistré(s)');
  });

  it('shows a placeholder for optional fields left absent by the API', async () => {
    const fixture = await createFixture(() =>
      of(
        buildMemberPage({
          items: [
            {
              id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
              firstName: 'Fatoumata',
              lastName: 'Camara',
              displayName: 'Fatoumata Camara',
              incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie A' },
              status: 'INACTIVE',
            },
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const row = root.querySelector('tbody tr');
    expect(row?.textContent).toContain('Inactif');
    expect(row?.textContent?.match(/Non renseigné/g)?.length).toBe(5);
  });

  it('disables the previous page control on the first page and enables the next one', async () => {
    const fixture = await createFixture(() =>
      of(buildMemberPage({ page: { number: 0, size: 20, totalElements: 21, totalPages: 2 } })),
    );
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const previousButton = buttons[0] as HTMLButtonElement;
    const nextButton = buttons[1] as HTMLButtonElement;

    expect(previousButton.getAttribute('aria-disabled')).toBe('true');
    expect(nextButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('loads and displays the members beyond the first page of 20', async () => {
    // Régression T-21 : au-delà de 20 membres, la première réponse ne contient
    // qu'`items` de la page 0. Sans pagination, les membres suivants restent
    // invisibles bien que le compteur affiche le total réel.
    const firstPageItems = Array.from({ length: 20 }, (_, index) =>
      buildMember({
        id: `a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d${index.toString().padStart(2, '0')}`,
        lastName: `Membre${index}`,
      }),
    );
    const secondPageMember = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d99',
      lastName: 'MembreVingtEtUnieme',
    });

    const listMembers = vi.fn((page?: number) => {
      if (page === 1) {
        return of(
          buildMemberPage({
            items: [secondPageMember],
            page: { number: 1, size: 20, totalElements: 21, totalPages: 2 },
          }),
        );
      }
      return of(
        buildMemberPage({
          items: firstPageItems,
          page: { number: 0, size: 20, totalElements: 21, totalPages: 2 },
        }),
      );
    });

    const fixture = await createFixture(listMembers);
    fixture.detectChanges();

    expect(listMembers).toHaveBeenCalledWith(0);
    expect(fixture.nativeElement.textContent).not.toContain('MembreVingtEtUnieme');

    const nextButton = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(listMembers).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('MembreVingtEtUnieme');
  });
});
