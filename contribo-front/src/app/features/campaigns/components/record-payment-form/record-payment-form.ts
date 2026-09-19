import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreatePaymentRequest, Due, PaymentMethod } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { AmountInput } from '@shared/amount-input/amount-input';
import { PaymentMethodSelect } from '@shared/payment-method-select/payment-method-select';

/**
 * Formulaire d'enregistrement d'un règlement de cotisation (T-71, US-COT-005) :
 * Membre et Campagne affichés en lecture seule (déjà portés par la cotisation
 * `due` sélectionnée), Montant, Date et Mode de règlement saisis. Construit la
 * requête `CreatePaymentRequest` (openapi:`createPayment`, `POST
 * /dues/{dueId}/payments`) et l'émet via `submitted` ; n'appelle pas l'API
 * lui-même, l'appel `RglementsService.createPayment(due.id, ...)` et le
 * rafraîchissement de la cotisation affichée restent à la charge du composant
 * appelant (même répartition des responsabilités que `CampaignCreateForm`,
 * T-65, et `SocialFundCreateForm`, T-84).
 *
 * Limites connues, couvertes par des tickets dédiés : ce formulaire ne bloque
 * pas localement un montant supérieur au reste à payer avant soumission
 * (RG-PAY-007, T-72) ; l'appelant reste responsable d'afficher l'erreur
 * `PAYMENT_EXCEEDS_REMAINING_AMOUNT` retournée par l'API le cas échéant.
 */
@Component({
  selector: 'app-record-payment-form',
  imports: [ReactiveFormsModule, TranslocoPipe, AmountInput, PaymentMethodSelect],
  templateUrl: './record-payment-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordPaymentForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly due = input.required<Due>();
  readonly submitting = input(false);
  readonly submitted = output<CreatePaymentRequest>();
  readonly cancelled = output<void>();

  readonly form = this.formBuilder.group({
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    paymentDate: this.formBuilder.nonNullable.control('', Validators.required),
    method: this.formBuilder.control<PaymentMethod | null>(null, Validators.required),
  });

  paymentDateInvalid(): boolean {
    const control = this.form.controls.paymentDate;
    return control.invalid && control.touched;
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.amount === null || raw.method === null) {
      return;
    }

    const request: CreatePaymentRequest = {
      amount: raw.amount,
      paymentDate: raw.paymentDate,
      method: raw.method,
    };
    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
