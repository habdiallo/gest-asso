import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PaymentMethod } from '@api';
import { PaymentMethodSelect } from './payment-method-select';

@Component({
  selector: 'app-host',
  imports: [ReactiveFormsModule, PaymentMethodSelect],
  template: `<app-payment-method-select [formControl]="control" [required]="true" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly control = new FormControl<PaymentMethod | null>(null);
}

describe('PaymentMethodSelect', () => {
  it('proposes exactly the three allowed settlement modes, without an online payment option', () => {
    const fixture = TestBed.createComponent(PaymentMethodSelect);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>,
    );
    const optionValues = options.map((option) => option.dataset['value']);

    expect(optionValues).toEqual([
      PaymentMethod.Cash,
      PaymentMethod.MobileMoney,
      PaymentMethod.BankTransfer,
    ]);
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Espèces',
      'Mobile Money',
      'Virement bancaire',
    ]);
  });

  it('writes the value provided by a bound reactive form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue(PaymentMethod.MobileMoney);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(trigger.textContent).toContain('Mobile Money');
  });

  it('propagates a user selection back to the bound reactive form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const option = fixture.nativeElement.querySelector(
      `[role="option"][data-value="${PaymentMethod.BankTransfer}"]`,
    ) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(PaymentMethod.BankTransfer);
  });

  it('marks the field invalid and announces an error once touched without a selection', () => {
    const fixture = TestBed.createComponent(PaymentMethodSelect);
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    select.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();

    expect(select.getAttribute('aria-invalid')).toBe('true');
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
    const select = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(select.getAttribute('aria-invalid')).toBeNull();
  });

  it('shows the error when the parent form calls markAllAsTouched without a blur', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();

    fixture.componentInstance.control.markAllAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    const select = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(select.getAttribute('aria-invalid')).toBe('true');
  });
});
