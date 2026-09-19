import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmptyState],
    });
  });

  it('announces the empty message to assistive technology via role="status"', () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('message', 'Aucun membre enregistré.');
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent?.trim()).toBe('Aucun membre enregistré.');
  });

  it('hides the decorative icon from assistive technology', () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('message', 'Aucune campagne.');
    fixture.detectChanges();

    const hiddenIcon: HTMLElement = fixture.nativeElement.querySelector('[aria-hidden="true"]');
    expect(hiddenIcon).toBeTruthy();
  });
});
