import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CampaignStatus, CurrencyCode, DueStatus, PaymentMethod } from '@api';
import type { CreatePaymentRequest, Due } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../../../assets/i18n/fr.json';
import { RecordPaymentForm } from './record-payment-form';

const due: Due = {
  id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
  member: {
    id: 'm1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    displayName: 'Aissatou Diallo',
  },
  campaign: {
    id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    name: 'Cotisation annuelle 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: CampaignStatus.Open,
  },
  incomeCategorySnapshot: {
    id: 'i1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    label: 'Standard',
  },
  dueAmount: 100000,
  paidAmount: 50000,
  remainingAmount: 50000,
  status: DueStatus.PartiallyPaid,
  paymentCount: 1,
  currency: CurrencyCode.Gnf,
};

async function createFixture(): Promise<ComponentFixture<RecordPaymentForm>> {
  await TestBed.configureTestingModule({
    imports: [
      RecordPaymentForm,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(RecordPaymentForm);
  fixture.componentRef.setInput('due', due);
  fixture.detectChanges();
  return fixture;
}

describe('RecordPaymentForm', () => {
  it('displays the member and campaign carried by the due, read-only', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Aissatou Diallo');
    expect(text).toContain('Cotisation annuelle 2026');
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('[role="alert"]').length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it('emits submitted with the built CreatePaymentRequest', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({
      amount: 25000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toEqual([
      { amount: 25000, paymentDate: '2026-09-18', method: PaymentMethod.MobileMoney },
    ]);
  });

  it('rejects a zero or negative amount', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({
      amount: 0,
      paymentDate: '2026-09-18',
      method: PaymentMethod.Cash,
    });

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });

  it('blocks a payment amount exceeding the remaining amount, with an explicit message (RG-PAY-007)', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({
      amount: 50001,
      paymentDate: '2026-09-18',
      method: PaymentMethod.Cash,
    });
    fixture.componentInstance.form.controls.amount.markAsTouched();
    fixture.detectChanges();

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Le montant ne peut pas dépasser 50000 GNF.');
  });

  it('accepts a payment amount equal to the remaining amount', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({
      amount: 50000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.Cash,
    });

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toEqual([
      { amount: 50000, paymentDate: '2026-09-18', method: PaymentMethod.Cash },
    ]);
  });

  it('re-evaluates the maximum allowed amount when the due input changes', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();

    fixture.componentRef.setInput('due', { ...due, remainingAmount: 10000 });
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({
      amount: 15000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.Cash,
    });

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
    expect(fixture.componentInstance.form.controls.amount.hasError('max')).toBe(true);
  });

  // Retour P3 de la revue de la PR #94 : sur une instance réutilisée pour une
  // autre cotisation, le message max affiché par AmountInput doit se
  // resynchroniser, pas seulement l'état `invalid` du FormGroup.
  it('shows the AmountInput max error message when due changes on a reused instance with an amount already entered', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.controls.amount.setValue(40000);
    fixture.componentInstance.form.controls.amount.markAsTouched();
    fixture.detectChanges();

    fixture.componentRef.setInput('due', { ...due, remainingAmount: 10000 });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(fixture.componentInstance.form.controls.amount.hasError('max')).toBe(true);
    expect(text).toContain('Le montant ne peut pas dépasser 10000 GNF.');
  });

  it('does not resubmit while a submission is already in progress', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentRef.setInput('submitting', true);
    fixture.componentInstance.form.setValue({
      amount: 25000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.BankTransfer,
    });
    fixture.detectChanges();

    const emitted: CreatePaymentRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });

  it('emits cancelled when the cancel button is activated', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: void[] = [];
    fixture.componentInstance.cancelled.subscribe(() => emitted.push(undefined));

    const cancelButton = fixture.nativeElement.querySelector(
      'button[type="button"]:not([aria-haspopup="listbox"])',
    ) as HTMLButtonElement;
    cancelButton.click();

    expect(emitted).toHaveLength(1);
  });
});
