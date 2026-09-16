import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('resolves a known key to its French translation', () => {
    const pipe = TestBed.runInInjectionContext(() => new TranslatePipe());

    expect(pipe.transform('auth.login.submit')).toBe('Se connecter');
  });
});
