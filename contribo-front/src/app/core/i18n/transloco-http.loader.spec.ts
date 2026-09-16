import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoHttpLoader } from './transloco-http.loader';

describe('TranslocoHttpLoader', () => {
  let loader: TranslocoHttpLoader;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    loader = TestBed.inject(TranslocoHttpLoader);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the translation file for the requested locale from assets/i18n', () => {
    loader.getTranslation('fr').subscribe();

    const req = httpMock.expectOne('assets/i18n/fr.json');
    expect(req.request.method).toBe('GET');
    req.flush({ 'auth.login.submit': 'Se connecter' });
  });
});
