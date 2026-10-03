import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideCspTranspiler } from '@core/i18n/csp-transpiler';
import fr from '@assets/i18n/fr.json';
import { CustomSelect } from './custom-select';
import type { CustomSelectOption } from './custom-select';

const OPTIONS: readonly CustomSelectOption[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

@Component({
  selector: 'app-host',
  imports: [ReactiveFormsModule, CustomSelect],
  template: `<app-custom-select
    [formControl]="control"
    [options]="options"
    label="Rôle"
    [required]="true"
    [pill]="pill"
    [compact]="compact"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly control = new FormControl<string | null>(null);
  options = OPTIONS;
  pill = false;
  compact = false;
}

describe('CustomSelect', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [provideCspTranspiler()],
    }).compileComponents();
  });

  it('marks a required custom select in the label and accessibility tree', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(label.textContent).toContain('*');
    expect(label.textContent).toContain('Champ obligatoire');
    expect(trigger.getAttribute('aria-required')).toBe('true');
  });

  it('supports a pill trigger for toolbar filters', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.pill = true;
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(trigger.classList.contains('rounded-full')).toBe(true);
    expect(trigger.classList.contains('rounded-lg')).toBe(false);
  });

  it('reflects an initial value from the bound reactive form control on the trigger', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue('b');
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(trigger.textContent).toContain('Option B');
  });

  it('preserves the compact radius for non-pill controls', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.compact = true;
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(trigger.classList.contains('rounded')).toBe(false);
    expect(trigger.classList.contains('rounded-lg')).toBe(true);
    expect(trigger.classList.contains('rounded-full')).toBe(false);
  });

  it('opens the menu on trigger click, selects an option on click, propagates it and closes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const optionButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]'),
    );
    expect(optionButtons.map((button) => button.textContent?.trim())).toEqual([
      'Option A',
      'Option B',
      'Option C',
    ]);

    optionButtons[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('c');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders a first-line search and filters options when more than 20 are available', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.options = Array.from({ length: 21 }, (_, index) => ({
      value: `option-${index + 1}`,
      label: `Option ${index + 1}`,
    }));
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    const filterInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="search"]');
    expect(filterInput).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="option"]')).toHaveLength(21);

    filterInput.value = 'Option 21';
    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<Element>,
      ).map((option) => option.textContent?.trim()),
    ).toEqual(['Option 21']);
  });

  it('keeps one option in the tab order while moving the roving focus target', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    let optionButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]'),
    );
    expect(optionButtons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);

    optionButtons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    optionButtons = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
    expect(optionButtons.map((button) => button.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('opens the menu and focuses an option on ArrowDown from the trigger', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();

    const optionButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]'),
    );
    expect(document.activeElement).toBe(optionButtons[0]);
  });

  it('closes the menu and returns focus to the trigger on Escape from an option', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    const optionButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]'),
    );
    optionButtons[0].focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes the menu when clicking outside without changing the value', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('disables the trigger when the bound reactive form control is disabled', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(trigger.disabled).toBe(true);
  });
});
