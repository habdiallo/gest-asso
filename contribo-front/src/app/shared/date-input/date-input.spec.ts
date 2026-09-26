import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../assets/i18n/fr.json';
import { DateInput } from './date-input';

@Component({
  selector: 'app-date-input-host',
  imports: [ReactiveFormsModule, DateInput],
  template: `<app-date-input controlId="demo-date" [formControl]="control" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly control = new FormControl('2026-09-26');
}

describe('DateInput', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
    }).compileComponents();
  });

  it('renders the API date in the French display format', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#demo-date') as HTMLButtonElement;
    expect(trigger.textContent).toContain('26/09/2026');
  });

  it('opens a themed calendar and propagates a selected date', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#demo-date') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.bg-surface-glass')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);

    const selectedDate = Array.from(
      fixture.nativeElement.querySelectorAll('[role="dialog"] button'),
    ).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === '15',
    ) as HTMLButtonElement;
    selectedDate.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('2026-09-15');
    expect(trigger.textContent).toContain('15/09/2026');
  });

  it('preselects today when empty and enables the today action after another date is selected', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue('');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#demo-date') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const today = fixture.nativeElement.querySelector(
      '[aria-current="date"][aria-pressed="true"]',
    ) as HTMLButtonElement;
    const todayAction = Array.from(
      fixture.nativeElement.querySelectorAll('[role="dialog"] button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === "Aujourd'hui") as
      HTMLButtonElement | undefined;

    expect(today).not.toBeNull();
    expect(todayAction?.disabled).toBe(true);

    const anotherDate = Array.from(
      fixture.nativeElement.querySelectorAll('[role="dialog"] button'),
    ).find(
      (button) =>
        (button as HTMLButtonElement).textContent?.trim() === '15' &&
        !(button as HTMLButtonElement).hasAttribute('aria-current'),
    ) as HTMLButtonElement;
    anotherDate.click();
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();
    const enabledTodayAction = Array.from(
      fixture.nativeElement.querySelectorAll('[role="dialog"] button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === "Aujourd'hui") as
      HTMLButtonElement | undefined;

    expect(enabledTodayAction?.disabled).toBe(false);
  });

  it('uses contrast-safe text and selection states in the themed calendar', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#demo-date') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.text-text-2')).not.toBeNull();
    const selected = fixture.nativeElement.querySelector('[aria-pressed="true"]') as HTMLElement;
    expect(selected.classList.contains('bg-gold-wash')).toBe(true);
    expect(selected.classList.contains('ring-gold')).toBe(true);
    expect(selected.classList.contains('text-text')).toBe(true);
  });
});
