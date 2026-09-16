import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { sessionExpiredInterceptor } from './session-expired.interceptor';
import { SessionService } from './session.service';

describe('sessionExpiredInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let session: SessionService;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    session.setSession({
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
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('clears the session and redirects to the login screen on a 401 response', () => {
    let observedError: unknown;
    httpClient
      .get('/api/v1/members')
      .subscribe({ error: (error: unknown) => (observedError = error) });

    httpMock
      .expectOne('/api/v1/members')
      .flush(
        { code: 'AUTHENTICATION_REQUIRED', message: 'Session expirée' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(session.token()).toBeNull();
    expect(session.user()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
    expect(observedError).toBeTruthy();
  });

  it('does not clear the session on a 403 access-denied response', () => {
    httpClient.get('/api/v1/members').subscribe({ error: () => undefined });

    httpMock
      .expectOne('/api/v1/members')
      .flush(
        { code: 'ACCESS_DENIED', message: 'Accès refusé' },
        { status: 403, statusText: 'Forbidden' },
      );

    expect(session.token()).toBe('session-token-value');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('does not redirect for a 401 returned by the login request itself', () => {
    httpClient.post('/api/v1/auth/login', {}).subscribe({ error: () => undefined });

    httpMock
      .expectOne('/api/v1/auth/login')
      .flush(
        { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(session.token()).toBe('session-token-value');
  });
});
