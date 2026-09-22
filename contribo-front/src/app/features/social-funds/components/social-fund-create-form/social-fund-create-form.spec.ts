import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { SocialEventType } from '@api';
import type { CreateSocialFundRequest } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../../../assets/i18n/fr.json';
import { SocialFundCreateForm } from './social-fund-create-form';

async function createFixture(): Promise<ComponentFixture<SocialFundCreateForm>> {
  await TestBed.configureTestingModule({
    imports: [
      SocialFundCreateForm,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SocialFundCreateForm);
  fixture.detectChanges();
  return fixture;
}

const validValue = {
  title: 'Mariage de Fanta et Sékou',
  eventType: SocialEventType.Wedding,
  description: '',
  beneficiary: 'Famille Camara',
  startDate: '2026-09-05',
  endDate: '2026-09-28',
  targetAmount: null,
};

describe('SocialFundCreateForm', () => {
  it('lists the five event types as select options', async () => {
    const fixture = await createFixture();

    const trigger = fixture.nativeElement.querySelector(
      '#social-fund-create-event-type',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<Element>,
    ).map((option) => option.textContent?.trim());
    expect(options).toEqual(
      expect.arrayContaining(['Mariage', 'Baptême', 'Décès', 'Naissance', 'Autre']),
    );
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    const fixture = await createFixture();

    const emitted: CreateSocialFundRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('[role="alert"]').length).toBeGreaterThanOrEqual(
      5,
    );
  });

  it('emits submitted with the built request when the form is valid, omitting empty optional fields', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue(validValue);

    const emitted: CreateSocialFundRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        title: 'Mariage de Fanta et Sékou',
        eventType: SocialEventType.Wedding,
        beneficiary: 'Famille Camara',
        startDate: '2026-09-05',
        endDate: '2026-09-28',
      },
    ]);
  });

  it('transmits the optional description and target amount when provided', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue({
      ...validValue,
      description: 'Collecte pour le mariage',
      targetAmount: 7000000,
    });

    const emitted: CreateSocialFundRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toEqual([
      {
        title: 'Mariage de Fanta et Sékou',
        eventType: SocialEventType.Wedding,
        beneficiary: 'Famille Camara',
        startDate: '2026-09-05',
        endDate: '2026-09-28',
        description: 'Collecte pour le mariage',
        targetAmount: 7000000,
      },
    ]);
  });

  it('blocks submission when the end date is before the start date', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue({
      ...validValue,
      startDate: '2026-09-28',
      endDate: '2026-09-05',
    });
    fixture.componentInstance.form.controls.startDate.markAsTouched();
    fixture.componentInstance.form.controls.endDate.markAsTouched();

    const submitted = vi.fn();
    fixture.componentInstance.submitted.subscribe(submitted);
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(submitted).not.toHaveBeenCalled();
    expect(fixture.componentInstance.dateRangeInvalid()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('#social-fund-create-end-date-error')?.textContent,
    ).toContain('postérieure ou égale');
  });

  it('does not resubmit while a submission is already in progress', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('submitting', true);
    fixture.componentInstance.form.setValue(validValue);
    fixture.detectChanges();

    const emitted: CreateSocialFundRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });

  it('blocks submission and marks the field invalid when the title is only whitespace', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue({ ...validValue, title: '   ' });

    const emitted: CreateSocialFundRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.componentInstance.titleInvalid()).toBe(true);
  });

  it('blocks submission and marks the field invalid when the beneficiary is only whitespace', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue({ ...validValue, beneficiary: '   ' });

    const emitted: CreateSocialFundRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.componentInstance.beneficiaryInvalid()).toBe(true);
  });

  it('shows a validation error when the target amount is zero', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue({ ...validValue, targetAmount: 0 });
    fixture.componentInstance.form.controls.targetAmount.markAsTouched();
    fixture.detectChanges();

    const errorParagraph: HTMLParagraphElement | null =
      fixture.nativeElement.querySelector('[role="alert"]');
    const amountInput: HTMLInputElement =
      fixture.nativeElement.querySelector('app-amount-input input');
    expect(amountInput.getAttribute('aria-invalid')).toBe('true');
    expect(errorParagraph?.textContent).toContain('au moins 1 GNF');
  });

  it('shows a validation error when the description exceeds 1000 characters', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.form.setValue({ ...validValue, description: 'a'.repeat(1001) });
    fixture.componentInstance.form.controls.description.markAsTouched();
    fixture.detectChanges();

    expect(fixture.componentInstance.descriptionInvalid()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('#social-fund-create-description-error')?.textContent,
    ).toContain('1000 caractères');
  });

  it('emits cancelled when the cancel button is activated', async () => {
    const fixture = await createFixture();

    const emitted: void[] = [];
    fixture.componentInstance.cancelled.subscribe(() => emitted.push(undefined));

    const cancelButton = fixture.nativeElement.querySelector(
      'button[type="button"]:not([aria-haspopup="listbox"])',
    ) as HTMLButtonElement;
    cancelButton.click();

    expect(emitted).toHaveLength(1);
  });
});
