import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CategoriesDeRevenuService, EspacePersonnelService } from '@core/api';
import type { CurrentUser, IncomeCategory, LoginResponse } from '@core/api';
import { SessionService } from '@core/session/session.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import fr from '@assets/i18n/fr.json';
import { App } from './app';
import { routes } from './app.routes';

function buildLoginResponse(role: CurrentUser['role'], mustChangePassword = false): LoginResponse {
  return {
    accessToken: 'session-token-value',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
      association: {
        id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        name: 'Association Test',
        currency: 'GNF',
      },
      member: {
        id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
        firstName: 'Awa',
        lastName: 'Camara',
        displayName: 'Awa Camara',
        incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
        status: 'ACTIVE',
      },
      role,
      operatorCanRecordPayments: false,
      accountActive: true,
      mustChangePassword,
    },
  };
}

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideRouter(routes),
        {
          provide: CategoriesDeRevenuService,
          useValue: {
            listIncomeCategories: () => of([] as IncomeCategory[]),
          } as unknown as CategoriesDeRevenuService,
        },
        {
          provide: EspacePersonnelService,
          useValue: { getCurrentUser: () => of(null) },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('hides the logout action when no session is active', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-logout-button')).toBeNull();
  });

  it('shows the logout action and the Administrator navigation menu once a session is active', () => {
    TestBed.inject(SessionService).setSession({
      accessToken: 'session-token-value',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
        association: {
          id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
          name: 'Association Test',
          currency: 'GNF',
        },
        member: {
          id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
          firstName: 'Awa',
          lastName: 'Camara',
          displayName: 'Awa Camara',
          incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
          status: 'ACTIVE',
        },
        role: 'ADMINISTRATOR',
        operatorCanRecordPayments: false,
        accountActive: true,
      },
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('header app-logout-button')).toBeNull();
    (fixture.nativeElement.querySelector('.mobile-profile-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('header app-logout-button')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-navigation-menu nav')).toBeTruthy();
  });

  it('presents the mobile account panel with identity and distinct account actions', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const profileButton = root.querySelector('.mobile-profile-button') as HTMLButtonElement;
    profileButton.click();
    fixture.detectChanges();

    expect(profileButton.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('.mobile-profile-summary strong')?.textContent).toContain(
      'Awa Camara',
    );
    expect(root.querySelector('.mobile-profile-summary span')?.textContent).toContain(
      'Administrateur',
    );
    expect(root.querySelector('.mobile-profile-account-action')?.textContent).toContain(
      'Ouvrir mon accès',
    );
    expect(root.querySelector('.mobile-profile-logout .logout-button')?.textContent).toContain(
      'Se déconnecter',
    );
  });

  it.each<CurrentUser['role']>(['ADMINISTRATOR', 'TREASURER', 'OPERATOR', 'MEMBER'])(
    'keeps the complete logout action for %s and removes the authenticated shell after activation',
    async (role) => {
      const session = TestBed.inject(SessionService);
      session.setSession(buildLoginResponse(role));
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      (root.querySelector('.mobile-profile-button') as HTMLButtonElement).click();
      fixture.detectChanges();
      const logout = root.querySelector('header app-logout-button button') as HTMLButtonElement;
      expect(logout.textContent?.trim()).toBe('Se déconnecter');
      expect(logout.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      logout.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(session.token()).toBeNull();
      expect(localStorage.getItem('contribo-session-token')).toBeNull();
      expect(TestBed.inject(Router).url).toBe('/login');
      expect(root.querySelector('header')).toBeNull();
      expect(root.querySelector('aside')).toBeNull();
      expect(root.querySelector('app-logout-button')).toBeNull();
      expect(root.querySelector('app-theme-toggle button')).toBeTruthy();
    },
  );

  it('redirects an unauthenticated visitor from the root to the login screen', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.tagName).toBe('APP-LOGIN-PAGE');
  });

  it.each<CurrentUser['role']>(['ADMINISTRATOR', 'TREASURER', 'OPERATOR', 'MEMBER'])(
    'shows the current session identity in the desktop sidebar for %s',
    (role) => {
      const session = TestBed.inject(SessionService);
      session.setSession(buildLoginResponse(role));
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const profile = root.querySelector('aside .sidebar-profile');
      expect(profile?.querySelector('strong')?.textContent).toBe('Awa Camara');
      expect(profile?.querySelector('.sidebar-avatar')?.textContent).toBe('AC');
      expect(profile?.tagName).toBe('BUTTON');
      expect(profile?.querySelector('.sidebar-profile-chevron')).toBeTruthy();
      expect(root.querySelector('header .sidebar-profile')).toBeNull();
      expect(root.querySelector('.desktop-topbar app-theme-toggle button')).toBeTruthy();
      expect(root.querySelector('aside app-logout-button')).toBeNull();
      expect(root.querySelector('header app-logout-button')).toBeNull();
      (root.querySelector('.mobile-profile-button') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(root.querySelector('header app-logout-button button')?.textContent?.trim()).toBe(
        'Se déconnecter',
      );

      const user = buildLoginResponse(role).user;
      session.setUser({ ...user, member: { ...user.member, displayName: 'Fatoumata Keita' } });
      fixture.detectChanges();
      expect(profile?.querySelector('strong')?.textContent).toBe('Fatoumata Keita');
      expect(profile?.querySelector('strong')?.getAttribute('title')).toBe('Fatoumata Keita');
      expect(profile?.querySelector('.sidebar-avatar')?.textContent).toBe('FK');
    },
  );

  it.each<[CurrentUser['role'], string]>([
    ['ADMINISTRATOR', '/mon-compte'],
    ['TREASURER', '/mon-compte'],
    ['OPERATOR', '/mon-compte'],
    ['MEMBER', '/mon-espace'],
  ])('opens the contextual personal destination for %s', async (role, expectedPath) => {
    TestBed.inject(SessionService).setSession(buildLoginResponse(role));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('aside .sidebar-profile') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe(expectedPath);
  });

  it('keeps the public shell while the cookie session is loading', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('aside .sidebar-profile')).toBeNull();
    expect(root.querySelector('.fixed app-theme-toggle button')).toBeTruthy();
  });

  it('updates the desktop breadcrumb label as the route changes (T-117)', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.desktop-breadcrumb strong')?.textContent?.trim()).toBe(
      'Tableau de bord',
    );

    await router.navigateByUrl('/campagnes');
    fixture.detectChanges();

    expect(root.querySelector('.desktop-breadcrumb strong')?.textContent?.trim()).toBe('Campagnes');
  });

  it('redirects an unknown unauthenticated route to login', async () => {
    const harness = await RouterTestingHarness.create('/unknown');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.tagName).toBe('APP-LOGIN-PAGE');
  });

  it('loads the access-denied screen at /acces-refuse', async () => {
    const harness = await RouterTestingHarness.create('/acces-refuse');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Accès refusé');
  });

  it('allows the Administrator role to reach the income categories route', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));

    await RouterTestingHarness.create('/categories-de-revenu');

    expect(TestBed.inject(Router).url).toBe('/categories-de-revenu');
  });

  it.each<CurrentUser['role']>(['TREASURER', 'OPERATOR', 'MEMBER'])(
    'redirects the %s role away from the income categories route',
    async (role) => {
      TestBed.inject(SessionService).setSession(buildLoginResponse(role));

      await RouterTestingHarness.create('/categories-de-revenu');

      expect(TestBed.inject(Router).url).toBe('/acces-refuse');
    },
  );

  it('redirects an unauthenticated visitor away from the income categories route', async () => {
    // authenticatedMatch renvoie false sans rediriger : la route ne matche pas
    // et Angular retombe sur le joker applicatif, qui redirige vers login.
    await RouterTestingHarness.create('/categories-de-revenu');

    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('redirects a limited session away from the member space', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('MEMBER', true));

    await RouterTestingHarness.create('/mon-espace');

    expect(TestBed.inject(Router).url).toBe('/changer-mot-de-passe');
  });

  // T-99 (RG-DATA-001) : un Membre ne consulte que ses propres données via
  // l'espace personnel (/mon-espace, T-95, `getMyProfile`), jamais la fiche
  // d'un autre membre. `roleGuard('ADMINISTRATOR', 'TREASURER', 'OPERATOR')`
  // protège déjà toute la route montée `membres` (T-21) ; ces tests
  // confirment que ce mécanisme existant bloque bien la liste et la fiche
  // détaillée pour ce rôle, sans garde supplémentaire à introduire.
  it('redirects the Member role away from the members list route', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('MEMBER'));

    await RouterTestingHarness.create('/membres');

    expect(TestBed.inject(Router).url).toBe('/acces-refuse');
  });

  it('redirects the Member role away from another member detail route', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('MEMBER'));

    await RouterTestingHarness.create('/membres/c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d99');

    expect(TestBed.inject(Router).url).toBe('/acces-refuse');
  });
});
