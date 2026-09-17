import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { CurrentUser, LoginResponse } from '@api';
import { SessionService } from '@core/session/session.service';
import { NavigationMenu } from './navigation-menu';

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

describe('NavigationMenu', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [NavigationMenu],
      providers: [provideRouter([])],
    });
  });

  it('renders nothing when no session is active', () => {
    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('renders the Administrator items with links to the expected paths', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Membres',
      'Catégories de revenu',
      'Campagnes',
      'Cagnottes',
      'Rôles et utilisateurs',
      'Mon espace',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/membres',
      '/categories-de-revenu',
      '/campagnes',
      '/cagnottes',
      '/roles-utilisateurs',
      '/mon-espace',
    ]);
  });

  it('renders the Treasurer items without income categories nor roles/users', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('TREASURER'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Membres',
      'Campagnes',
      'Cagnottes',
      'Mon espace',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/membres',
      '/campagnes',
      '/cagnottes',
      '/mon-espace',
    ]);
  });

  it('renders the Operator items limited to consultation (membres, campagnes, cagnottes, mon espace)', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('OPERATOR'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Membres',
      'Campagnes',
      'Cagnottes',
      'Mon espace',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/membres',
      '/campagnes',
      '/cagnottes',
      '/mon-espace',
    ]);
  });

  it('renders only the personal space item for the Member role', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('MEMBER'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Mon espace']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/mon-espace']);
  });

  it.each([
    [
      'ADMINISTRATOR',
      [
        '/membres',
        '/campagnes',
        '/cagnottes',
        '/mon-espace',
        '/categories-de-revenu',
        '/roles-utilisateurs',
      ],
    ],
    ['TREASURER', ['/membres', '/campagnes', '/cagnottes', '/mon-espace']],
    ['OPERATOR', ['/membres', '/campagnes', '/cagnottes', '/mon-espace']],
    ['MEMBER', ['/mon-espace']],
  ] as const)('keeps the allowed destinations in the vertical menu for %s', (role, paths) => {
    TestBed.inject(SessionService).setSession(buildLoginResponse(role));
    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const links = Array.from(root.querySelectorAll('nav a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(paths);
    expect(root.querySelectorAll('.sidebar-nav-section').length).toBe(
      role === 'ADMINISTRATOR' ? 1 : 0,
    );
    expect(
      links.every((link) => link.querySelector('svg')?.getAttribute('aria-hidden') === 'true'),
    ).toBe(true);

    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    expect(root.querySelector('.sidebar-nav-section')).toBeNull();
    expect(root.querySelector('svg')).toBeNull();
    expect(
      Array.from(root.querySelectorAll('nav a'))
        .map((link) => link.getAttribute('href'))
        .sort(),
    ).toEqual([...paths].sort());
  });
});
