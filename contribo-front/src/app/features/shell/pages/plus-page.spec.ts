import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CurrencyCode, MemberStatus, UserRole } from '@core/api';
import type { CurrentUser } from '@core/api';
import { SessionLogoutService } from '@core/session/session-logout.service';
import { SessionService } from '@core/session/session.service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import fr from '@assets/i18n/fr.json';
import { PlusPage } from './plus-page';

function buildCurrentUser(role: UserRole): CurrentUser {
  return {
    userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    association: {
      id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      name: 'Association Test',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
      firstName: 'Awa',
      lastName: 'Camara',
      displayName: 'Awa Camara',
      incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
      status: MemberStatus.Active,
    },
    role,
    operatorCanRecordPayments: false,
    accountActive: true,
  };
}

describe('PlusPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlusPage,
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SessionLogoutService, useValue: { logout: () => of(undefined) } },
      ],
    }).compileComponents();
  });

  it('keeps the administration heading for an Administrator', () => {
    TestBed.inject(SessionService).setUser(buildCurrentUser(UserRole.Administrator));

    const fixture = TestBed.createComponent(PlusPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Administration');
    expect(fixture.nativeElement.textContent).toContain('Votre espace de gestion');
  });

  it.each([UserRole.Treasurer, UserRole.Operator, UserRole.Member])(
    'uses a personal heading for %s',
    (role) => {
      TestBed.inject(SessionService).setUser(buildCurrentUser(role));

      const fixture = TestBed.createComponent(PlusPage);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent ?? '';
      expect(text).toContain('Espace personnel');
      expect(text).toContain('Votre espace personnel');
      expect(text).not.toContain('Administration');
      expect(text).not.toContain('Votre espace de gestion');
    },
  );
});
