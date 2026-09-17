import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { MembresService } from '@api';
import type { MemberPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { MembersListPage } from './members-list-page';

function buildMemberPage(overrides: Partial<MemberPage> = {}): MemberPage {
  return {
    items: [
      {
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
      },
    ],
    summary: { total: 91, active: 86, inactive: 5 },
    page: { number: 0, size: 20, totalElements: 91, totalPages: 5 },
    ...overrides,
  };
}

async function createFixture(
  listMembers: () => Observable<MemberPage>,
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
      { provide: MembresService, useValue: { listMembers } as unknown as MembresService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MembersListPage);
  fixture.detectChanges();
  return fixture;
}

describe('MembersListPage', () => {
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
});
