import type { PaymentMethod } from '@api';
import { PAYMENT_METHOD_OPTIONS } from '@shared/payment-method-select/payment-method-options';

/**
 * Réutilise le mapping partagé des modes de règlement
 * (`payment-method-options.ts`, T-20) pour afficher le mode d'une
 * contribution aux cagnottes dans l'onglet dédié de la fiche membre (T-30),
 * sans dupliquer les libellés Espèces / Mobile Money / Virement bancaire.
 */
export function memberContributionMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}
