import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-optional-host',
  imports: [ReactiveFormsModule, AmountInput],
  template: `<app-amount-input [formControl]="form.controls.amount" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionalHostComponent {
  readonly form = new FormGroup({
    amount: new FormControl<number | null>(5000, Validators.min(2000)),
  });
}

describe('AmountInput', () => {
  it.each(['1000,50', '1000.50', '9007199254740993', '9'.repeat(309)])(
    'makes an optional amount invalid for rejected input %s and recovers after correction',
    (rawValue) => {
      const fixture = TestBed.createComponent(OptionalHostComponent);
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      const form = fixture.componentInstance.form;

      input.value = rawValue;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(form.valid).toBe(false);
      expect(form.controls.amount.errors).toEqual({ gnfAmount: true });
      expect(form.controls.amount.value).toBeNull();

      input.value = '4000';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(form.valid).toBe(true);
      expect(form.controls.amount.errors).toBeNull();
      expect(form.controls.amount.value).toBe(4000);
    },
  );

  it('accepts an empty optional amount again and keeps the host validators', () => {
    const fixture = TestBed.createComponent(OptionalHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const form = fixture.componentInstance.form;

    for (const rawValue of ['1000,50', '']) {
      input.value = rawValue;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
    expect(form.valid).toBe(true);
    expect(form.controls.amount.value).toBeNull();

    input.value = '1000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(form.valid).toBe(false);
    expect(form.controls.amount.hasError('min')).toBe(true);
    expect(form.controls.amount.hasError('gnfAmount')).toBe(false);
  });

  it('shows and announces the parent min error once the control is touched', () => {
    const fixture = TestBed.createComponent(OptionalHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const form = fixture.componentInstance.form;

    input.value = '1000';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(form.controls.amount.hasError('min')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'au moins 2000 GNF',
    );
  });

  it('clears the input error when the parent resets the control', () => {
    const fixture = TestBed.createComponent(OptionalHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const form = fixture.componentInstance.form;
    input.value = '1000,50';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(form.valid).toBe(false);

    form.reset();
    fixture.detectChanges();

    expect(form.valid).toBe(true);
    expect(input.value).toBe('');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('formats digits live with a thousands separator as the user types', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1250000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('1 250 000');
  });

  it('strips stray non-digit characters that are not a decimal separator', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1a2b5c0';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('1 250');
    expect(fixture.componentInstance.value()).toBe(1250);
  });

  it('rejects a pasted decimal value instead of reinterpreting it as a larger integer', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '12,5a0.3';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('12,5a0.3');
    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('rejects a decimal amount with a comma separator, without turning it into an integer 100x larger', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1000,50';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.value).not.toBe('100050');
  });

  it('rejects a decimal amount with a period separator', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1000.50';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.value).not.toBe('100050');
  });

  it('rejects a value that exceeds Number.MAX_SAFE_INTEGER instead of silently propagating an imprecise value', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '9007199254740993';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('rejects a value so large it would convert to Infinity instead of propagating it', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '9'.repeat(309);
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('propagates null instead of an invalid amount to the bound reactive form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1000,50';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('accepts a valid amount again after a rejected decimal input is corrected', () => {
    const fixture = TestBed.createComponent(AmountInput);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1000,50';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();

    input.value = '1000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(1000);
    expect(input.value).toBe('1 000');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
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
