import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CatgoriesDeRevenuService, CurrencyCode, MemberStatus, UserRole } from '@api';
import type { IncomeCategory, MemberDetails, UpdateMemberRequest } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { MemberEditForm } from './member-edit-form';

const category: IncomeCategory = {
  id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
  label: 'Catégorie A',
  memberCount: 12,
  updatedAt: '2026-08-01T09:00:00Z',
};

const member: MemberDetails = {
  id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
  firstName: 'Amadou',
  lastName: 'Diallo',
  preferredName: 'Bah',
  displayName: 'Amadou Diallo',
  country: 'Guinée',
  city: 'Conakry',
  phone: '+224 622 12 34 56',
  incomeCategory: category,
  associationFunction: 'Président',
  status: MemberStatus.Active,
  account: {
    id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13',
    role: UserRole.Member,
    operatorCanRecordPayments: false,
    active: true,
  },
  financialSummary: {
    totalDueAmount: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0,
    currency: CurrencyCode.Gnf,
  },
};

async function createFixture(): Promise<ComponentFixture<MemberEditForm>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberEditForm,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: CatgoriesDeRevenuService,
        useValue: { listIncomeCategories: () => of([category]) },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MemberEditForm);
  fixture.componentRef.setInput('member', member);
  fixture.detectChanges();
  return fixture;
}

describe('MemberEditForm', () => {
  it('initializes fields from the member and emits only changed values', async () => {
    const fixture = await createFixture();
    const emitted: UpdateMemberRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    fixture.componentInstance.form.patchValue({ city: 'Kindia', preferredName: '' });
    fixture.componentInstance.submit();

    expect(emitted).toEqual([{ city: 'Kindia', preferredName: null }]);
  });

  it('does not emit when the form has no changes', async () => {
    const fixture = await createFixture();
    const submitted = vi.fn();
    fixture.componentInstance.submitted.subscribe(submitted);

    fixture.componentInstance.submit();

    expect(submitted).not.toHaveBeenCalled();
  });

  it('exposes no status control, regardless of role (RG-MEM-018)', async () => {
    const fixture = await createFixture();

    expect(fixture.componentInstance.form.contains('status')).toBe(false);

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[formcontrolname="status"]')).toBeNull();
    expect(root.querySelector('[id*="status" i]')).toBeNull();
  });

  it('never includes status in the update request, even if a caller tampers with the form', async () => {
    const fixture = await createFixture();
    const emitted: UpdateMemberRequest[] = [];
    fixture.componentInstance.submitted.subscribe((request) => emitted.push(request));

    fixture.componentInstance.form.patchValue({ city: 'Kindia' });
    fixture.componentInstance.submit();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).not.toHaveProperty('status');
  });
});
