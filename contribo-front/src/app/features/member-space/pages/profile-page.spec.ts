import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { CurrentUser } from '@api';
import { CurrencyCode, MemberStatus, UserRole } from '@api';
import { EspacePersonnelService } from '@api';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import fr from '../../../../assets/i18n/fr.json';
import { ProfilePage } from './profile-page';

function buildCurrentUser(overrides: Partial<CurrentUser['member']> = {}): CurrentUser {
  return {
    userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    association: {
      id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      name: 'Association Test',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
      firstName: 'Amadou',
      lastName: 'Diallo',
      displayName: 'Amadou Diallo',
      incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Catégorie B' },
      status: MemberStatus.Active,
      ...overrides,
    },
    role: UserRole.Member,
    operatorCanRecordPayments: false,
    accountActive: true,
  };
}

async function createFixture(user: CurrentUser | null): Promise<ComponentFixture<ProfilePage>> {
  await TestBed.configureTestingModule({
    imports: [
      ProfilePage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: SessionService,
        useValue: { user: signal(user) } as unknown as SessionService,
      },
      {
        provide: EspacePersonnelService,
        useValue: {
          listMyDues: () =>
            of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
          listMyContributions: () =>
            of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
        } as unknown as EspacePersonnelService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ProfilePage);
  fixture.detectChanges();
  return fixture;
}

describe('ProfilePage', () => {
  it('renders the connected member personal information', async () => {
    const fixture = await createFixture(
      buildCurrentUser({
        preferredName: 'Bah',
        country: 'Guinée',
        city: 'Conakry',
        phone: '+224 622 12 34 56',
        associationFunction: 'Président',
      }),
    );

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.textContent).toContain('Diallo');
    expect(root.textContent).toContain('Amadou');
    expect(root.textContent).toContain('Bah');
    expect(root.textContent).toContain('+224 622 12 34 56');
    expect(root.textContent).toContain('Guinée');
    expect(root.textContent).toContain('Conakry');
    expect(root.textContent).toContain('Catégorie B');
    expect(root.textContent).toContain('Président');
    expect(root.textContent).toContain('Actif');
  });

  it('shows a placeholder for optional fields left blank', async () => {
    const fixture = await createFixture(buildCurrentUser());

    const root: HTMLElement = fixture.nativeElement;
    const notProvidedOccurrences = root.textContent?.match(/Non renseigné/g) ?? [];
    expect(notProvidedOccurrences.length).toBe(5);
  });

  it('never proposes any edit action on this read-only screen', async () => {
    const fixture = await createFixture(buildCurrentUser());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('button[aria-controls="personal-panel-profile"]')).not.toBeNull();
    expect(root.querySelector('button[aria-controls="personal-panel-dues"]')).not.toBeNull();
    expect(
      root.querySelector('button[aria-controls="personal-panel-contributions"]'),
    ).not.toBeNull();
    expect(root.querySelector('input')).toBeNull();
  });

  it('shows an error state when no member profile is available', async () => {
    const fixture = await createFixture(null);

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger votre profil',
    );
  });
});
