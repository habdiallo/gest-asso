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
import { filter, map } from 'rxjs';
import { formatGnfAmountInputDigits, sanitizeGnfAmountDigits } from '@core/formatting/currency';

let nextInstanceId = 0;

/**
 * Saisie d'un montant GNF avec formatage automatique en direct (RG-FMT-001,
 * RG-FMT-002) : les caractères non numériques sont rejetés au fil de la
 * frappe et l'affichage applique le séparateur de milliers utilisé pour
 * l'affichage détaillé, sans jamais accepter de décimale. La valeur exposée
 * au formulaire hôte redevient un entier avant tout envoi, conformément à
 * la règle « une saisie formatée doit redevenir un entier validé ».
 *
 * Implémente `ControlValueAccessor` pour s'utiliser avec `formControlName`.
 * L'accesseur est assigné manuellement à `NgControl` (au lieu du provider
 * `NG_VALUE_ACCESSOR`) pour pouvoir lire l'état `touched` réel du
 * `FormControl` hôte : reset()/markAllAsTouched() ne passent pas par
 * `registerOnTouched`, un signal local dédié divergerait donc du parent.
 */
@Component({
  selector: 'app-amount-input',
  templateUrl: './amount-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountInput implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly instanceId = `amount-input-${++nextInstanceId}`;

  readonly label = input('Montant');
  readonly required = input(false);

  readonly fieldId = this.instanceId;
  readonly errorId = `${this.instanceId}-error`;
  readonly unitHintId = `${this.instanceId}-unit`;

  readonly value = signal<number | null>(null);
  readonly displayValue = signal('');
  readonly disabled = signal(false);

  private readonly touchedFallback = signal(false);
  private readonly touchedFromControl = signal<boolean | null>(null);
  readonly touched = computed(() => this.touchedFromControl() ?? this.touchedFallback());

  readonly showRequiredError = computed(
    () => this.touched() && this.required() && this.value() === null,
  );

  readonly describedBy = computed(() =>
    this.showRequiredError() ? `${this.unitHintId} ${this.errorId}` : this.unitHintId,
  );

  private onChange: (value: number | null) => void = () => {};
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

  writeValue(value: number | null): void {
    if (value === null) {
      this.value.set(null);
      this.displayValue.set('');
      return;
    }

    const integerAmount = Math.trunc(value);
    this.value.set(integerAmount);
    this.displayValue.set(formatGnfAmountInputDigits(String(Math.abs(integerAmount))));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement).value;
    const digits = sanitizeGnfAmountDigits(rawValue);
    const formatted = formatGnfAmountInputDigits(digits);
    const numericValue = digits ? Number(digits) : null;

    this.displayValue.set(formatted);
    this.value.set(numericValue);
    (event.target as HTMLInputElement).value = formatted;
    this.onChange(numericValue);
  }

  handleBlur(): void {
    this.touchedFallback.set(true);
    this.onTouched();
  }
}
