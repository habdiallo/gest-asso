import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ControlValueAccessor } from '@angular/forms';
import { NgControl, TouchedChangeEvent } from '@angular/forms';
import type { PaymentMethod } from '@api';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { filter, map } from 'rxjs';
import { PAYMENT_METHOD_OPTIONS } from './payment-method-options';

let nextInstanceId = 0;

/**
 * Sélection du mode de règlement d'un règlement ou d'une contribution,
 * restreinte aux trois valeurs Espèces, Mobile Money et Virement bancaire
 * (RG-PAY-009, RG-016). Aucune intégration de paiement en ligne.
 *
 * Implémente `ControlValueAccessor` pour s'utiliser avec `formControlName`
 * dans les formulaires réactifs typés des écrans de saisie de règlement.
 * L'accesseur est assigné manuellement à `NgControl` (au lieu du provider
 * `NG_VALUE_ACCESSOR`) pour pouvoir lire l'état `touched` réel du
 * `FormControl` hôte : reset()/markAllAsTouched() ne passent pas par
 * `registerOnTouched`, un signal local dédié divergerait donc du parent.
 */
@Component({
  selector: 'app-payment-method-select',
  imports: [CustomSelect],
  templateUrl: './payment-method-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelect implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly instanceId = `payment-method-select-${++nextInstanceId}`;

  readonly label = input('Mode de règlement');
  readonly required = input(false);

  readonly options = PAYMENT_METHOD_OPTIONS;
  readonly fieldId = this.instanceId;
  readonly errorId = `${this.instanceId}-error`;

  readonly value = signal<PaymentMethod | null>(null);
  readonly disabled = signal(false);

  private readonly touchedFallback = signal(false);
  private readonly touchedFromControl = signal<boolean | null>(null);
  readonly touched = computed(() => this.touchedFromControl() ?? this.touchedFallback());

  private onChange: (value: PaymentMethod | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    this.touchedFromControl.set(control.touched);
    control.events
      .pipe(
        filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
        map((event) => event.touched),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((touchedValue) => this.touchedFromControl.set(touchedValue));
  }

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

  handleChange(rawValue: string | null): void {
    const selected = this.options.find((option) => option.value === rawValue)?.value ?? null;
    this.value.set(selected);
    this.onChange(selected);
  }

  handleBlur(): void {
    this.touchedFallback.set(true);
    this.onTouched();
  }
}
