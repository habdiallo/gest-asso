import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CatgoriesDeRevenuService } from '@api';
import type { CreateMemberRequest, IncomeCategory } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { MemberCreateForm } from './member-create-form';

const categories: IncomeCategory[] = [
  {
    id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
    label: 'Catégorie A',
    memberCount: 12,
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
    label: 'Catégorie B',
    memberCount: 3,
    updatedAt: '2026-08-01T09:00:00Z',
  },
];

async function createFixture(
  listIncomeCategories: () => Observable<IncomeCategory[]> = () => of(categories),
): Promise<ComponentFixture<MemberCreateForm>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberCreateForm,
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

  const fixture = TestBed.createComponent(MemberCreateForm);
  fixture.detectChanges();
  return fixture;
}

describe('MemberCreateForm', () => {
  it('loads the income categories and lists them as select options', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('option');
    expect(
      Array.from(options).map((option) => (option as HTMLOptionElement).textContent?.trim()),
    ).toEqual(expect.arrayContaining(['Catégorie A', 'Catégorie B']));
  });

  it('shows an error when the income categories fail to load', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les catégories de revenu',
    );
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: CreateMemberRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('[role="alert"]').length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it('emits submitted with the built request when the form is valid, omitting empty optional fields', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      lastName: 'Diallo',
      firstName: 'Amadou',
      preferredName: '',
      country: '',
      city: '',
      phone: '',
      incomeCategoryId: categories[0].id,
      associationFunction: '',
    });

    const emitted: CreateMemberRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        lastName: 'Diallo',
        firstName: 'Amadou',
        incomeCategoryId: categories[0].id,
      },
    ]);
  });

  it.each(['abc', '123456', '12345678901234567890123456', '+1234567890123456789012345'])(
    'blocks the invalid phone %s and associates the error with the field',
    async (phone) => {
      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.componentInstance.form.patchValue({
        lastName: 'Diallo',
        firstName: 'Amadou',
        incomeCategoryId: categories[0].id,
        phone,
      });
      const submitted = vi.fn();
      fixture.componentInstance.submitted.subscribe(submitted);
      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(submitted).not.toHaveBeenCalled();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#member-create-phone');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('member-create-phone-error');
      expect(
        fixture.nativeElement.querySelector('#member-create-phone-error')?.textContent,
      ).toContain('7 à 25 caractères');
    },
  );

  it.each(['1234567', '+224 622 12 34 56', '1234567890123456789012345'])(
    'transmits the valid optional phone %s',
    async (phone) => {
      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.componentInstance.form.patchValue({
        lastName: 'Diallo',
        firstName: 'Amadou',
        incomeCategoryId: categories[0].id,
        phone,
      });
      const submitted = vi.fn();
      fixture.componentInstance.submitted.subscribe(submitted);
      fixture.componentInstance.submit();

      expect(submitted).toHaveBeenCalledWith({
        lastName: 'Diallo',
        firstName: 'Amadou',
        incomeCategoryId: categories[0].id,
        phone,
      });
    },
  );

  it('does not resubmit while a submission is already in progress', async () => {
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentRef.setInput('submitting', true);
    fixture.componentInstance.form.setValue({
      lastName: 'Diallo',
      firstName: 'Amadou',
      preferredName: '',
      country: '',
      city: '',
      phone: '',
      incomeCategoryId: categories[0].id,
      associationFunction: '',
    });
    fixture.detectChanges();

    const emitted: CreateMemberRequest[] = [];
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
