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
  listMembers: (page?: number, size?: number, q?: string) => Observable<MemberPage> = () =>
    of(memberPage),
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
  it('uses the shared landscape grid for member and contribution fields', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const grids = fixture.nativeElement.querySelectorAll('.grid[class~="min-[821px]:grid-cols-2"]');
    expect(grids.length).toBeGreaterThanOrEqual(2);
    expect(grids[0].querySelector('#contribution-create-member-search')).not.toBeNull();
    expect(grids[0].querySelector('#contribution-create-member')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Mariage de Fanta et Sékou');
    expect(fixture.nativeElement.querySelector('.border-t.border-line')).not.toBeNull();
  });

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

    const trigger = fixture.nativeElement.querySelector(
      '#contribution-create-member',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<Element>,
    ).map((option) => option.textContent?.trim());
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

  it('switches to an external contributor and emits the external identity', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    const externalCheckbox = fixture.nativeElement.querySelector(
      '#contribution-create-external',
    ) as HTMLInputElement;
    externalCheckbox.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.contributorMode()).toBe('external');
    fixture.componentInstance.form.setValue({
      memberId: '',
      amount: 200000,
      contributionDate: '2026-09-15',
      method: PaymentMethod.Cash,
    });
    fixture.componentInstance.externalForm.setValue({
      firstName: 'Mamadou',
      lastName: 'Camara',
    });
    fixture.detectChanges();

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toEqual([
      {
        externalContributor: { firstName: 'Mamadou', lastName: 'Camara' },
        amount: 200000,
        contributionDate: '2026-09-15',
        method: PaymentMethod.Cash,
      },
    ]);
    expect(fixture.nativeElement.querySelector('#contribution-create-member')).toBeNull();
  });

  it('blocks an external contribution when the identity is incomplete', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.setContributorMode('external');
    fixture.componentInstance.form.setValue({
      memberId: '',
      amount: 200000,
      contributionDate: '2026-09-15',
      method: PaymentMethod.Cash,
    });
    fixture.detectChanges();

    const emitted: CreateContributionRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(0);
    expect(fixture.componentInstance.externalFirstNameInvalid()).toBe(true);
    expect(fixture.componentInstance.externalLastNameInvalid()).toBe(true);
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

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button[type="button"]'),
    ) as HTMLButtonElement[];
    const cancelButton = buttons.find((button) => button.textContent?.trim() === 'Annuler');
    if (!cancelButton) {
      throw new Error('Le bouton Annuler est introuvable.');
    }
    cancelButton.click();

    expect(emitted).toHaveLength(1);
  });

  it('searches members by name, resets to the first page and debounces the request', async () => {
    const listMembers = vi.fn(() => of(memberPage));
    const fixture = await createFixture(listMembers);
    await fixture.whenStable();
    listMembers.mockClear();

    const searchInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '#contribution-create-member-search',
    );
    searchInput.value = 'Fanta';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(listMembers).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(listMembers).toHaveBeenCalledWith(0, 20, 'Fanta');
  });

  it('loads the next page of members and ignores a stale response from a previous page', async () => {
    const secondPage: MemberPage = {
      items: [
        {
          id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13',
          firstName: 'Mariama',
          lastName: 'Sow',
          displayName: 'Sow Mariama',
          incomeCategory: { id: 'cat-1', label: 'Standard' },
          status: MemberStatus.Active,
        },
      ],
      summary: { total: 21, active: 21, inactive: 0 },
      page: { number: 1, size: 20, totalElements: 21, totalPages: 2 },
    };
    const firstPageMultiple: MemberPage = {
      ...memberPage,
      page: { number: 0, size: 20, totalElements: 21, totalPages: 2 },
    };
    const listMembers = vi.fn((page?: number) => of(page === 0 ? firstPageMultiple : secondPage));
    const fixture = await createFixture(listMembers);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.membersNextPage();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(listMembers).toHaveBeenLastCalledWith(1, 20, undefined);
    const trigger = fixture.nativeElement.querySelector(
      '#contribution-create-member',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"]') as NodeListOf<Element>,
    ).map((option) => option.textContent?.trim());
    expect(options).toContain('Sow Mariama');
  });
});
