import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EspacePersonnelService } from '@api';
import type { CurrentUser } from '@api';
import { SessionService } from '@core/session/session.service';
import { hydrateCurrentUser } from './app.config';

const currentUser: CurrentUser = {
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
};

describe('hydrateCurrentUser', () => {
  let session: SessionService;
  let espacePersonnel: EspacePersonnelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    session = TestBed.inject(SessionService);
    espacePersonnel = TestBed.inject(EspacePersonnelService);
    httpMock = TestBed.inject(HttpTestingController);
    session.setSession({
      accessToken: 'session-token-value',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: currentUser,
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('hydrates the user on a successful response', async () => {
    const promise = hydrateCurrentUser(session, espacePersonnel);

    httpMock.expectOne('/api/v1/me').flush(currentUser);
    await promise;

    expect(session.user()).toEqual(currentUser);
    expect(session.token()).toBe('session-token-value');
  });

  it('clears the session on a 401 response', async () => {
    const promise = hydrateCurrentUser(session, espacePersonnel);

    httpMock.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    await promise;

    expect(session.token()).toBeNull();
    expect(localStorage.getItem('contribo-session-token')).toBeNull();
  });

  it('keeps the session on a 500 response', async () => {
    const promise = hydrateCurrentUser(session, espacePersonnel);

    httpMock
      .expectOne('/api/v1/me')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await promise;

    expect(session.token()).toBe('session-token-value');
    expect(session.user()).toEqual(currentUser);
    expect(localStorage.getItem('contribo-session-token')).toBe('session-token-value');
  });

  it('keeps the session on a network error', async () => {
    const promise = hydrateCurrentUser(session, espacePersonnel);

    httpMock
      .expectOne('/api/v1/me')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    await promise;

    expect(session.token()).toBe('session-token-value');
    expect(session.user()).toEqual(currentUser);
    expect(localStorage.getItem('contribo-session-token')).toBe('session-token-value');
  });
});
