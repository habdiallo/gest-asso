import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { PaymentMethod } from '@api';
import { PAYMENT_METHOD_OPTIONS } from './payment-method-options';

let nextInstanceId = 0;

/**
 * Sélection du mode de règlement d'un règlement ou d'une contribution,
 * restreinte aux trois valeurs Espèces, Mobile Money et Virement bancaire
 * (RG-PAY-009, RG-016). Aucune intégration de paiement en ligne.
 *
 * Implémente `ControlValueAccessor` pour s'utiliser avec `formControlName`
 * dans les formulaires réactifs typés des écrans de saisie de règlement.
 */
@Component({
  selector: 'app-payment-method-select',
  templateUrl: './payment-method-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaymentMethodSelect),
      multi: true,
    },
  ],
})
export class PaymentMethodSelect implements ControlValueAccessor {
  private readonly instanceId = `payment-method-select-${++nextInstanceId}`;

  readonly label = input('Mode de règlement');
  readonly required = input(false);

  readonly options = PAYMENT_METHOD_OPTIONS;
  readonly fieldId = this.instanceId;
  readonly errorId = `${this.instanceId}-error`;

  readonly value = signal<PaymentMethod | null>(null);
  readonly disabled = signal(false);
  readonly touched = signal(false);

  private onChange: (value: PaymentMethod | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: PaymentMethod | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: PaymentMethod | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleChange(event: Event): void {
    const rawValue = (event.target as HTMLSelectElement).value;
    const selected = this.options.find((option) => option.value === rawValue)?.value ?? null;
    this.value.set(selected);
    this.onChange(selected);
  }

  handleBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
