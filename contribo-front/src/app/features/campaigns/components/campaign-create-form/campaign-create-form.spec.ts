import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CatgoriesDeRevenuService, CreateCampaignRequest } from '@api';
import type { IncomeCategory } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { CampaignCreateForm } from './campaign-create-form';

const categories: IncomeCategory[] = [
  {
    id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
    label: 'Standard',
    memberCount: 58,
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
    label: 'Bienfaiteur',
    memberCount: 24,
    updatedAt: '2026-08-01T09:00:00Z',
  },
];

const categoriesWithoutMembers: IncomeCategory[] = [
  {
    id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13',
    label: 'Vide',
    memberCount: 0,
    updatedAt: '2026-08-01T09:00:00Z',
  },
];

async function createFixture(
  listIncomeCategories: () => Observable<IncomeCategory[]> = () => of(categories),
): Promise<ComponentFixture<CampaignCreateForm>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignCreateForm,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: CatgoriesDeRevenuService,
        useValue: { listIncomeCategories } as unknown as CatgoriesDeRevenuService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CampaignCreateForm);
  fixture.detectChanges();
  return fixture;
}

const validValue = {
  name: 'Solidarité octobre',
  description: '',
  startDate: '2026-10-01',
  endDate: '2026-10-31',
};

describe('CampaignCreateForm', () => {
  it('shows a fixed, disabled "membres concernés" field with all active members', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#campaign-create-member-selection',
    );
    expect(select.disabled).toBe(true);
    expect(select.textContent).toContain('Tous les membres actifs');
  });

  it('shows an error when the income categories fail to load', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les catégories de revenu',
    );
  });

  it('blocks submission when no income category is carried by an active member', async () => {
    const fixture = await createFixture(() => of(categoriesWithoutMembers));
    await fixture.whenStable();
    fixture.componentInstance.form.setValue(validValue);
    fixture.detectChanges();

    const emitted: CreateCampaignRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      "Aucune catégorie de revenu n'est portée par un membre actif",
    );
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: CreateCampaignRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('[role="alert"]').length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it('blocks submission and marks the field invalid when the name is only whitespace', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({ ...validValue, name: '   ' });

    const emitted: CreateCampaignRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.componentInstance.nameInvalid()).toBe(true);
  });

  it('blocks submission when the end date is before the start date', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({
      ...validValue,
      startDate: '2026-10-31',
      endDate: '2026-10-01',
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
      fixture.nativeElement.querySelector('#campaign-create-end-date-error')?.textContent,
    ).toContain('postérieure ou égale');
  });

  it('shows a validation error when the description exceeds 1000 characters', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({ ...validValue, description: 'a'.repeat(1001) });
    fixture.componentInstance.form.controls.description.markAsTouched();
    fixture.detectChanges();

    expect(fixture.componentInstance.descriptionInvalid()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('#campaign-create-description-error')?.textContent,
    ).toContain('1000 caractères');
  });

  it('emits submitted with the built request, deriving categoryAmounts from categories carried by a member', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue(validValue);

    const emitted: CreateCampaignRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(1);
    const request = emitted[0];
    expect(request.name).toBe('Solidarité octobre');
    expect(request.startDate).toBe('2026-10-01');
    expect(request.endDate).toBe('2026-10-31');
    expect(request.memberSelection).toBe(
      CreateCampaignRequest.MemberSelectionEnum.AllActiveMembers,
    );
    expect(Array.from(request.categoryAmounts)).toEqual([
      { incomeCategoryId: categories[0].id, amount: 0 },
      { incomeCategoryId: categories[1].id, amount: 0 },
    ]);
    expect(request.description).toBeUndefined();
  });

  it('transmits the optional description when provided', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({
      ...validValue,
      description: 'Campagne générale de soutien.',
    });

    const emitted: CreateCampaignRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));
    fixture.componentInstance.submit();

    expect(emitted[0]?.description).toBe('Campagne générale de soutien.');
  });

  it('does not resubmit while a submission is already in progress', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentRef.setInput('submitting', true);
    fixture.componentInstance.form.setValue(validValue);
    fixture.detectChanges();

    const emitted: CreateCampaignRequest[] = [];
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
      'button[type="button"]',
    ) as HTMLButtonElement;
    cancelButton.click();

    expect(emitted).toHaveLength(1);
  });
});
