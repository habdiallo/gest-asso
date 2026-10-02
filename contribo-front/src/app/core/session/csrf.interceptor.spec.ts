import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { csrfInterceptor } from './csrf.interceptor';

describe('csrfInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    document.cookie = 'XSRF-TOKEN=csrf-token-value; path=/';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([csrfInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    httpMock.verify();
  });

  it('copies the CSRF cookie to mutating API requests', () => {
    httpClient.post('/api/v1/members', {}).subscribe();

    const request = httpMock.expectOne('/api/v1/members');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-token-value');
    request.flush({});
  });

  it('does not add the CSRF header to safe requests', () => {
    httpClient.get('/api/v1/members').subscribe();

    const request = httpMock.expectOne('/api/v1/members');
    expect(request.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    request.flush({});
  });

  it('reuses the response header when the cookie is not readable', () => {
    httpClient.get('/api/v1/auth/csrf').subscribe();

    const csrfRequest = httpMock.expectOne('/api/v1/auth/csrf');
    csrfRequest.flush(null, {
      status: 204,
      statusText: 'No Content',
      headers: new HttpHeaders({ 'X-XSRF-TOKEN': 'response-token-value' }),
    });
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    httpClient.post('/api/v1/members', {}).subscribe();

    const request = httpMock.expectOne('/api/v1/members');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('response-token-value');
    request.flush({});
  });
});
