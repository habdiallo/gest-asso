import { TestBed } from '@angular/core/testing';
import { ApiErrorRetry } from './api-error-retry';

describe('ApiErrorRetry', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiErrorRetry],
    });
  });

  it('announces the generic error message to assistive technology via role="alert"', () => {
    const fixture = TestBed.createComponent(ApiErrorRetry);
    fixture.componentRef.setInput('message', 'Une erreur est survenue.');
    fixture.componentRef.setInput('retryLabel', 'Réessayer');
    fixture.detectChanges();

    const alert: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.textContent?.trim()).toBe('Une erreur est survenue.');
  });

  it('emits retry when the retry button is activated', () => {
    const fixture = TestBed.createComponent(ApiErrorRetry);
    fixture.componentRef.setInput('message', 'Une erreur est survenue.');
    fixture.componentRef.setInput('retryLabel', 'Réessayer');
    fixture.detectChanges();

    const retrySpy = vi.fn();
    fixture.componentInstance.retry.subscribe(retrySpy);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('Réessayer');
    button.click();

    expect(retrySpy).toHaveBeenCalledTimes(1);
  });
});
