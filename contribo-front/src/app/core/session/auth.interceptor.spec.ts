import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { SessionService } from './session.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends credentials for cookie-based sessions without an Authorization header', () => {
    httpClient.get('/api/v1/members').subscribe();

    const request = httpMock.expectOne('/api/v1/members');
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('does not expose a session token through an Authorization header', () => {
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

    httpClient.get('/api/v1/members').subscribe();

    const request = httpMock.expectOne('/api/v1/members');
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });
});
