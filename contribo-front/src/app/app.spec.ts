import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CatgoriesDeRevenuService } from '@api';
import type { CurrentUser, IncomeCategory, LoginResponse } from '@api';
import { SessionService } from '@core/session/session.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import fr from '../assets/i18n/fr.json';
import { App } from './app';
import { routes } from './app.routes';

function buildLoginResponse(role: CurrentUser['role']): LoginResponse {
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
          provide: CatgoriesDeRevenuService,
          useValue: {
            listIncomeCategories: () => of([] as IncomeCategory[]),
          } as unknown as CatgoriesDeRevenuService,
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

    expect(fixture.nativeElement.querySelector('app-logout-button')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-navigation-menu nav')).toBeTruthy();
  });

  it('loads the home feature at the root route', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Contribo');
    expect(harness.routeNativeElement?.querySelector('main')).toBeTruthy();
  });

  it('redirects an unknown route to the home feature', async () => {
    const harness = await RouterTestingHarness.create('/unknown');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Contribo');
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
    // et Angular retombe sur le joker applicatif, qui redirige vers l'accueil.
    await RouterTestingHarness.create('/categories-de-revenu');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
