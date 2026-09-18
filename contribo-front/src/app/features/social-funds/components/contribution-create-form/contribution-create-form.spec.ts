import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { MembresService, MemberStatus, PaymentMethod } from '@api';
import type { CreateContributionRequest, MemberPage, MemberSummary } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { NEVER, of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { ContributionCreateForm } from './contribution-create-form';

const members: MemberSummary[] = [
  {
    id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
    firstName: 'Fanta',
    lastName: 'Camara',
    displayName: 'Camara Fanta',
    incomeCategory: { id: 'cat-1', label: 'Standard' },
    status: MemberStatus.Active,
  },
  {
    id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
    firstName: 'Sékou',
    lastName: 'Diallo',
    displayName: 'Diallo Sékou',
    incomeCategory: { id: 'cat-1', label: 'Standard' },
    status: MemberStatus.Active,
  },
];

const memberPage: MemberPage = {
  items: members,
  summary: { total: 2, active: 2, inactive: 0 },
  page: { number: 0, size: 100, totalElements: 2, totalPages: 1 },
};

async function createFixture(
  listMembers: () => Observable<MemberPage> = () => of(memberPage),
): Promise<ComponentFixture<ContributionCreateForm>> {
  await TestBed.configureTestingModule({
    imports: [
      ContributionCreateForm,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: MembresService,
        useValue: { listMembers } as unknown as MembresService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ContributionCreateForm);
  fixture.componentRef.setInput('socialFundTitle', 'Mariage de Fanta et Sékou');
  fixture.detectChanges();
  return fixture;
}

const validValue = {
  memberId: members[0].id,
  amount: 150000,
  contributionDate: '2026-09-14',
  method: PaymentMethod.MobileMoney,
};

describe('ContributionCreateForm', () => {
  it('displays the social fund title as read-only context', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mariage de Fanta et Sékou');
  });

  it('lists the loaded members as select options', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('#contribution-create-member option'),
    ).map((option) => (option as HTMLOptionElement).textContent?.trim());
    expect(options).toEqual(expect.arrayContaining(['Camara Fanta', 'Diallo Sékou']));
  });

  it('shows an error when the members fail to load', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la liste des membres',
    );
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.componentInstance.memberIdInvalid()).toBe(true);
    expect(fixture.componentInstance.contributionDateInvalid()).toBe(true);
  });

  it('emits submitted with the built request when the form is valid', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue(validValue);

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toEqual([
      {
        memberId: members[0].id,
        amount: 150000,
        contributionDate: '2026-09-14',
        method: PaymentMethod.MobileMoney,
      },
    ]);
  });

  it('does not resubmit while a submission is already in progress', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentRef.setInput('submitting', true);
    fixture.componentInstance.form.setValue(validValue);
    fixture.detectChanges();

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });

  it('blocks submission while the members are still loading', async () => {
    const fixture = await createFixture(() => NEVER);
    fixture.componentInstance.form.setValue(validValue);

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });

  it('blocks submission when the members failed to load', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.componentInstance.form.setValue(validValue);

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });

  it('shows a validation error when the amount is below the contract minimum', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({ ...validValue, amount: 0 });
    fixture.componentInstance.form.controls.amount.markAsTouched();
    fixture.detectChanges();

    const amountInput: HTMLInputElement =
      fixture.nativeElement.querySelector('app-amount-input input');
    expect(amountInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('emits cancelled when the cancel button is activated', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: void[] = [];
    fixture.componentInstance.cancelled.subscribe(() => emitted.push(undefined));

    const cancelButton = fixture.nativeElement.querySelector(
      'button[type="button"]',
    ) as HTMLButtonElement;
    cancelButton.click();

    expect(emitted).toHaveLength(1);
  });
});
