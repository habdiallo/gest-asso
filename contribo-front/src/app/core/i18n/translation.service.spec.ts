import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('translates from the bundled French dictionary without any HTTP call', () => {
    expect(service.translate('auth.login.submit')).toBe('Se connecter');
  });

  it('returns the key itself when a translation is missing', () => {
    expect(service.translate('does.not.exist' as never)).toBe('does.not.exist');
  });

  it('loads a new locale from assets/i18n and falls back to French for missing keys', () => {
    service.setLocale('en').subscribe();

    httpMock.expectOne('assets/i18n/en.json').flush({ 'auth.login.submit': 'Log in' });

    expect(service.locale()).toBe('en');
    expect(service.translate('auth.login.submit')).toBe('Log in');
    expect(service.translate('auth.login.error')).toBe('Identifiant ou mot de passe incorrect.');
  });

  it('keeps the current locale when loading a new one fails', () => {
    service.setLocale('en').subscribe();
    httpMock.expectOne('assets/i18n/en.json').flush(null, { status: 404, statusText: 'Not Found' });

    expect(service.locale()).toBe('fr');
    expect(service.translate('auth.login.submit')).toBe('Se connecter');
  });

  it('does not refetch a locale that was already loaded', () => {
    service.setLocale('en').subscribe();
    httpMock.expectOne('assets/i18n/en.json').flush({ 'auth.login.submit': 'Log in' });

    service.setLocale('fr').subscribe();
    service.setLocale('en').subscribe();

    httpMock.expectNone('assets/i18n/en.json');
    expect(service.locale()).toBe('en');
  });
});
