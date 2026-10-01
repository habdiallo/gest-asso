import { CampaignStatus, CurrencyCode, DueStatus } from '@core/api';
import type { Due } from '@core/api';

const campaignReferences = {
  solidarity: {
    id: '10700000-0000-4000-8000-000000000200',
    name: 'Solidarité septembre',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: CampaignStatus.Open,
  },
  rentrée: {
    id: '10700000-0000-4000-8000-000000000201',
    name: 'Rentrée associative',
    startDate: '2026-09-26',
    endDate: '2026-10-31',
    status: CampaignStatus.Upcoming,
  },
  june: {
    id: '10700000-0000-4000-8000-000000000202',
    name: 'Soutien juin 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: CampaignStatus.Closed,
  },
  quarterly: {
    id: '10700000-0000-4000-8000-000000000203',
    name: 'Cotisation trimestrielle T3',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: CampaignStatus.Open,
  },
} as const;

const standardCategory = {
  id: '10700000-0000-4000-8000-000000000101',
  label: 'Standard',
};

function buildUpcomingCampaignDues(): Due[] {
  return Array.from({ length: 62 }, (_, index) => {
    const dueId = (0x420 + index).toString(16).padStart(12, '0');
    const memberId = (0x500 + index).toString(16).padStart(12, '0');
    return {
      id: `10700000-0000-4000-8000-${dueId}`,
      member: {
        id: `10700000-0000-4000-8000-${memberId}`,
        displayName: index === 0 ? 'Amadou Diallo' : `Membre ${String(index + 1).padStart(2, '0')}`,
      },
      campaign: campaignReferences.rentrée,
      incomeCategorySnapshot: standardCategory,
      dueAmount: 75_000,
      paidAmount: 0,
      remainingAmount: 75_000,
      status: DueStatus.Due,
      paymentCount: 0,
      currency: CurrencyCode.Gnf,
    } satisfies Due;
  });
}

/** Magasin mutable partagé par les handlers de campagne et de membre. */
export const demoCampaignDues: Record<string, Due[]> = {
  [campaignReferences.solidarity.id]: [
    {
      id: '10700000-0000-4000-8000-000000000410',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: campaignReferences.solidarity,
      incomeCategorySnapshot: standardCategory,
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000411',
      member: { id: '10700000-0000-4000-8000-000000000501', displayName: 'Fatoumata Bah' },
      campaign: campaignReferences.solidarity,
      incomeCategorySnapshot: standardCategory,
      dueAmount: 100_000,
      paidAmount: 0,
      remainingAmount: 100_000,
      status: DueStatus.Due,
      paymentCount: 0,
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000412',
      member: { id: '10700000-0000-4000-8000-000000000502', displayName: 'Mamadou Bah' },
      campaign: campaignReferences.solidarity,
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000102', label: 'Bienfaiteur' },
      dueAmount: 250_000,
      paidAmount: 250_000,
      remainingAmount: 0,
      status: DueStatus.Paid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000413',
      member: { id: '10700000-0000-4000-8000-000000000503', displayName: 'Aissatou Sow' },
      campaign: campaignReferences.solidarity,
      incomeCategorySnapshot: standardCategory,
      dueAmount: 100_000,
      paidAmount: 0,
      remainingAmount: 100_000,
      status: DueStatus.Overdue,
      paymentCount: 0,
      currency: CurrencyCode.Gnf,
    },
  ],
  [campaignReferences.rentrée.id]: buildUpcomingCampaignDues(),
  [campaignReferences.june.id]: [
    {
      id: '10700000-0000-4000-8000-000000000430',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: campaignReferences.june,
      incomeCategorySnapshot: standardCategory,
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
  ],
  [campaignReferences.quarterly.id]: [
    {
      id: '10700000-0000-4000-8000-000000000431',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: campaignReferences.quarterly,
      incomeCategorySnapshot: standardCategory,
      dueAmount: 100_000,
      paidAmount: 25_000,
      remainingAmount: 75_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
  ],
};

export function getDemoDuesForMember(memberId: string): Due[] {
  return Object.values(demoCampaignDues)
    .flat()
    .filter((due) => due.member.id === memberId)
    .map((due) => ({ ...due }));
}
