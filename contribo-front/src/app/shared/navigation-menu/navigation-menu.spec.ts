import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { CurrentUser, LoginResponse } from '@core/api';
import { SessionService } from '@core/session/session.service';
import { NavigationMenu } from './navigation-menu';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class BlankPage {}

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
      'Accueil',
      'Membres',
      'Cotisations',
      'Cagnottes',
      'Plus',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/membres',
      '/campagnes',
      '/cagnottes',
      '/plus',
    ]);
  });

  it('renders the Treasurer items without income categories nor roles/users', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('TREASURER'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Accueil',
      'Membres',
      'Cotisations',
      'Cagnottes',
      'Plus',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/membres',
      '/campagnes',
      '/cagnottes',
      '/plus',
    ]);
  });

  it('renders the Operator items limited to consultation (membres, campagnes, cagnottes, mon espace)', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('OPERATOR'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Accueil',
      'Membres',
      'Cotisations',
      'Cagnottes',
      'Plus',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/membres',
      '/campagnes',
      '/cagnottes',
      '/plus',
    ]);
  });

  it('renders only the personal space item for the Member role', () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('MEMBER'));

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Accueil', 'Plus']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/dashboard', '/plus']);
  });

  it.each([
    [
      'ADMINISTRATOR',
      ['/membres', '/campagnes', '/cagnottes', '/roles-utilisateurs', '/categories-de-revenu'],
    ],
    ['TREASURER', ['/membres', '/campagnes', '/cagnottes', '/mon-espace']],
    ['OPERATOR', ['/membres', '/campagnes', '/cagnottes', '/mon-espace']],
    ['MEMBER', ['/mon-espace']],
  ] as const)('keeps the allowed destinations in the vertical menu for %s', (role, paths) => {
    TestBed.inject(SessionService).setSession(buildLoginResponse(role));
    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    // Le lien « Tableau de bord » (T-117) reste commun aux deux compositions.
    const verticalPaths = ['/dashboard', ...paths];
    const root: HTMLElement = fixture.nativeElement;
    const links = Array.from(root.querySelectorAll('nav a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(verticalPaths);
    expect(root.querySelectorAll('.sidebar-nav-section').length).toBe(
      role === 'ADMINISTRATOR' ? 1 : 0,
    );
    expect(
      links.every((link) => link.querySelector('svg')?.getAttribute('aria-hidden') === 'true'),
    ).toBe(true);

    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    expect(root.querySelector('.sidebar-nav-section')).toBeNull();
    expect(root.querySelector('nav')?.classList.contains('mobile-nav')).toBe(true);
    const mobilePaths =
      role === 'MEMBER'
        ? ['/dashboard', '/plus']
        : ['/dashboard', '/membres', '/campagnes', '/cagnottes', '/plus'];
    expect(root.querySelectorAll('.mobile-nav-link')).toHaveLength(mobilePaths.length);
    expect(root.querySelector('.mobile-nav-link')?.textContent?.trim()).toBe('Accueil');
    expect(root.querySelector('nav')?.classList.contains('overflow-x-auto')).toBe(true);
    const rolesLink = root.querySelector('a[href="/roles-utilisateurs"]');
    if (rolesLink) {
      expect(rolesLink.querySelector('.mobile-nav-label-long')?.textContent?.trim()).toBe(
        'Utilisateurs & rôles',
      );
    }
    expect(
      Array.from(root.querySelectorAll('nav a')).every(
        (link) => link.querySelector('svg')?.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
    expect(
      Array.from(root.querySelectorAll('.mobile-nav-link')).every(
        (link) => link.getAttribute('aria-label') === link.textContent?.trim(),
      ),
    ).toBe(true);
    expect(
      Array.from(root.querySelectorAll('.mobile-nav-link > span')).every(
        (label) => label.classList.contains('mobile-nav-label-long') || label.textContent?.trim(),
      ),
    ).toBe(true);
    expect(
      Array.from(root.querySelectorAll('nav a'))
        .map((link) => link.getAttribute('href'))
        .sort(),
    ).toEqual(mobilePaths.sort());
  });

  it('shows the Tableau de bord link first in the vertical menu, with the active state on the dashboard route only', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NavigationMenu],
      providers: [
        provideRouter([
          { path: 'dashboard', pathMatch: 'full', component: BlankPage },
          { path: 'membres', component: BlankPage },
        ]),
      ],
    });
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
    expect(links[0].textContent?.trim()).toBe('Tableau de bord');
    expect(links[0].getAttribute('href')).toBe('/dashboard');
    expect(links[0].classList.contains('sidebar-link-active')).toBe(true);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links.slice(1).some((link) => link.classList.contains('sidebar-link-active'))).toBe(
      false,
    );

    await router.navigateByUrl('/membres');
    fixture.detectChanges();
    expect(links[0].classList.contains('sidebar-link-active')).toBe(false);
  });

  it('shows the active state on the current item in the horizontal mobile menu', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NavigationMenu],
      providers: [
        provideRouter([
          { path: 'dashboard', pathMatch: 'full', component: BlankPage },
          { path: 'membres', component: BlankPage },
          { path: 'mon-espace', component: BlankPage },
        ]),
      ],
    });
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/membres');

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const membersLink = fixture.nativeElement.querySelector(
      'a[href="/membres"]',
    ) as HTMLAnchorElement;
    expect(membersLink.classList.contains('mobile-nav-link-active')).toBe(true);
    expect(membersLink.getAttribute('aria-current')).toBe('page');
    expect(
      (
        fixture.nativeElement.querySelector('a[href="/dashboard"]') as HTMLAnchorElement
      ).classList.contains('mobile-nav-link-active'),
    ).toBe(false);

    await router.navigateByUrl('/mon-espace');
    fixture.detectChanges();
    const moreLink = fixture.nativeElement.querySelector('a[href="/plus"]') as HTMLAnchorElement;
    expect(moreLink.classList.contains('mobile-nav-link-active')).toBe(true);
    expect(moreLink.getAttribute('aria-current')).toBe('page');
  });

  it('keeps the Plus item active when opening a Plus destination from the Plus screen', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NavigationMenu],
      providers: [
        provideRouter([
          { path: 'dashboard', pathMatch: 'full', component: BlankPage },
          { path: 'membres', component: BlankPage },
          { path: 'plus', component: BlankPage },
          { path: 'mon-espace', component: BlankPage },
        ]),
      ],
    });
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/plus');

    const fixture = TestBed.createComponent(NavigationMenu);
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    await fixture.whenStable();

    const moreLink = fixture.nativeElement.querySelector('a[href="/plus"]') as HTMLAnchorElement;
    expect(moreLink.classList.contains('mobile-nav-link-active')).toBe(true);

    await router.navigateByUrl('/mon-espace');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(moreLink.classList.contains('mobile-nav-link-active')).toBe(true);
    expect(moreLink.getAttribute('aria-current')).toBe('page');

    await router.navigateByUrl('/membres');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(moreLink.classList.contains('mobile-nav-link-active')).toBe(false);
    expect(moreLink.getAttribute('aria-current')).toBeNull();
  });
});
