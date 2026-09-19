import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CurrencyCode, MemberStatus, UserRole } from '@api';
import type { MemberDetails, UpdateMemberRequest } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../../../assets/i18n/fr.json';
import { MemberEditFormOperator } from './member-edit-form-operator';

const member: MemberDetails = {
  id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
  firstName: 'Amadou',
  lastName: 'Diallo',
  preferredName: 'Bah',
  displayName: 'Amadou Diallo',
  country: 'Guinée',
  city: 'Conakry',
  phone: '+224 622 12 34 56',
  incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie A' },
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

async function createFixture(): Promise<ComponentFixture<MemberEditFormOperator>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberEditFormOperator,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MemberEditFormOperator);
  fixture.componentRef.setInput('member', member);
  fixture.detectChanges();
  return fixture;
}

describe('MemberEditFormOperator', () => {
  it('exposes only phone, city, country and preferred name in edition', async () => {
    const fixture = await createFixture();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('#member-edit-operator-phone')).not.toBeNull();
    expect(root.querySelector('#member-edit-operator-city')).not.toBeNull();
    expect(root.querySelector('#member-edit-operator-country')).not.toBeNull();
    expect(root.querySelector('#member-edit-operator-preferred-name')).not.toBeNull();
    expect(root.textContent).not.toContain('Catégorie de revenu');
    expect(root.textContent).not.toContain('Fonction associative');
  });

  it('emits only the changed restricted fields', async () => {
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

  it('blocks submission and marks the phone field invalid on a malformed value', async () => {
    const fixture = await createFixture();
    const submitted = vi.fn();
    fixture.componentInstance.submitted.subscribe(submitted);

    fixture.componentInstance.form.patchValue({ phone: 'abc' });
    fixture.componentInstance.submit();

    expect(submitted).not.toHaveBeenCalled();
    expect(fixture.componentInstance.phoneInvalid()).toBe(true);
  });

  it('emits cancelled when the cancel action is triggered', async () => {
    const fixture = await createFixture();
    const cancelled = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);

    fixture.componentInstance.cancel();

    expect(cancelled).toHaveBeenCalledTimes(1);
  });
});
