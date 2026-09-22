import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
  template: `<app-custom-select [formControl]="control" [options]="options" [required]="true" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly control = new FormControl<string | null>(null);
  readonly options = OPTIONS;
}

describe('CustomSelect', () => {
  it('reflects an initial value from the bound reactive form control on the trigger', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue('b');
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(trigger.textContent).toContain('Option B');
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

    optionButtons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
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
