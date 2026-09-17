import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CatgoriesDeRevenuService } from '@api';
import type { IncomeCategory } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { IncomeCategoriesPage } from './income-categories-page';

function buildCategory(overrides: Partial<IncomeCategory> = {}): IncomeCategory {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    label: 'Catégorie A',
    memberCount: 12,
    updatedAt: '2026-09-02T10:15:00Z',
    ...overrides,
  };
}

async function createFixture(
  listIncomeCategories: () => Observable<IncomeCategory[]>,
): Promise<ComponentFixture<IncomeCategoriesPage>> {
  await TestBed.configureTestingModule({
    imports: [
      IncomeCategoriesPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: CatgoriesDeRevenuService,
        useValue: { listIncomeCategories } as unknown as CatgoriesDeRevenuService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(IncomeCategoriesPage);
  fixture.detectChanges();
  return fixture;
}

describe('IncomeCategoriesPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<IncomeCategory[]>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des catégories de revenu',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les catégories de revenu',
    );
  });

  it('shows the empty-list message when no category exists', async () => {
    const fixture = await createFixture(() => of([]));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune catégorie de revenu.');
  });

  it('renders the categories with their label, member count and update date', async () => {
    const categories = [
      buildCategory({ label: 'Catégorie A', memberCount: 12 }),
      buildCategory({
        id: 'b5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        label: 'Catégorie B',
        memberCount: 31,
        updatedAt: '2026-09-05T08:00:00Z',
      }),
    ];
    const fixture = await createFixture(() => of(categories));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Catégorie A');
    expect(root.textContent).toContain('12');
    expect(root.textContent).toContain('Catégorie B');
    expect(root.textContent).toContain('31');
    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });
});
