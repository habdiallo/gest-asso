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

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const optionValues = Array.from(select.options)
      .map((option) => option.value)
      .filter((value) => value !== '');

    expect(optionValues).toEqual([
      PaymentMethod.Cash,
      PaymentMethod.MobileMoney,
      PaymentMethod.BankTransfer,
    ]);
    expect(Array.from(select.options).map((option) => option.text)).toEqual([
      'Sélectionner un mode de règlement',
      'Espèces',
      'Mobile Money',
      'Virement bancaire',
    ]);
  });

  it('writes the value provided by a bound reactive form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue(PaymentMethod.MobileMoney);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe(PaymentMethod.MobileMoney);
  });

  it('propagates a user selection back to the bound reactive form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = PaymentMethod.BankTransfer;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(PaymentMethod.BankTransfer);
  });

  it('marks the field invalid and announces an error once touched without a selection', () => {
    const fixture = TestBed.createComponent(PaymentMethodSelect);
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });
});
