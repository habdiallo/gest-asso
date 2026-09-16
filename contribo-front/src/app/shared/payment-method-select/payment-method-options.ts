import { PaymentMethod } from '@api';

/**
 * Modes de règlement autorisés pour tout enregistrement de règlement ou de
 * contribution (RG-PAY-009, RG-016). Aucune autre valeur ni intégration de
 * paiement en ligne n'est proposée.
 */
export interface PaymentMethodOption {
  readonly value: PaymentMethod;
  readonly label: string;
}

export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethodOption[] = [
  { value: PaymentMethod.Cash, label: 'Espèces' },
  { value: PaymentMethod.MobileMoney, label: 'Mobile Money' },
  { value: PaymentMethod.BankTransfer, label: 'Virement bancaire' },
];
