import type { PaymentMethod } from '@api';
import { PAYMENT_METHOD_OPTIONS } from '@shared/payment-method-select/payment-method-options';

/**
 * Réutilise le mapping partagé des modes de règlement (`payment-method-options.ts`,
 * T-20) pour afficher le mode d'un règlement dans l'historique de la fiche
 * membre (T-29), sans dupliquer les libellés Espèces / Mobile Money / Virement
 * bancaire.
 */
export function memberPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}
