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

async function createFixture(
  listSocialFunds: () => Observable<SocialFundPage>,
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
    expect(root.textContent).toContain('4 750 000 GNF');
    expect(root.textContent).toContain('7 000 000 GNF');
    expect(root.textContent).toContain('43 contributeur(s)');

    const progressBar = root.querySelector<HTMLElement>('.bg-gold');
    expect(progressBar?.style.width).toBe('67.9%');
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
    expect(root.textContent).toContain('1 850 000 GNF');
    expect(root.querySelector('.bg-gold')).toBeNull();
  });

  it('shows the empty-list message when there is no social fund', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage({ items: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune cagnotte pour le moment.');
  });
});
