import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AmountInput } from './amount-input';

@Component({
  selector: 'app-host',
  imports: [ReactiveFormsModule, AmountInput],
  template: `<app-amount-input [formControl]="control" [required]="true" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly control = new FormControl<number | null>(null);
}

describe('AmountInput', () => {
  it('formats digits live with a thousands separator as the user types', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1250000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('1 250 000');
  });

  it('rejects non-digit characters, keeping only the integer part of the input', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '12,5a0.3';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('12 503');
  });

  it('propagates a validated integer back to the bound reactive form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '50 000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(50000);
    expect(Number.isInteger(fixture.componentInstance.control.value)).toBe(true);
  });

  it('writes a value provided by a bound reactive form control, formatted for display', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue(2500000);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('2 500 000');
  });

  it('clears the field back to an empty value when every digit is removed', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue(50000);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBeNull();
    expect(input.value).toBe('');
  });

  it('marks the field invalid and announces an error once touched without an amount', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('hides the error again once the bound control is reset', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();

    fixture.componentInstance.control.reset();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('shows the error when the parent form calls markAllAsTouched without a blur', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();

    fixture.componentInstance.control.markAllAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });
});
