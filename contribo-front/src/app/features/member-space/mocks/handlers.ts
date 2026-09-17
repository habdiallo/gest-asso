import { HttpResponse, http } from 'msw';
import { CampaignStatus, CurrencyCode, DueStatus, ErrorCode } from '@api';
import type { Due, DuePage, ErrorResponse } from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

export const memberSpaceHandlers = [
  http.get('/api/v1/me/dues', ({ request }): Response => {
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const { member } = account.user;
    const due: Due = {
      id: `10700000-0000-4000-8000-${member.id.slice(-4)}10`,
      member: { id: member.id, displayName: member.displayName },
      campaign: {
        id: '10700000-0000-4000-8000-000000000200',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: CampaignStatus.Open,
      },
      incomeCategorySnapshot: member.incomeCategory,
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    };

    return HttpResponse.json<DuePage>({
      items: [due],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    });
  }),
];
