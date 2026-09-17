import { HttpResponse, delay, http } from 'msw';
import { CampaignStatus, ErrorCode } from '@api';
import type { CampaignPage, CampaignSummary, ErrorResponse } from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

const demoCampaigns: CampaignSummary[] = [
  {
    id: '10700000-0000-4000-8000-000000000200',
    name: 'Solidarité septembre',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: CampaignStatus.Open,
    memberCount: 86,
  },
  {
    id: '10700000-0000-4000-8000-000000000201',
    name: 'Rentrée scolaire',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    status: CampaignStatus.Upcoming,
    memberCount: 91,
  },
  {
    id: '10700000-0000-4000-8000-000000000202',
    name: 'Soutien juin 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: CampaignStatus.Closed,
    memberCount: 84,
  },
];

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

/**
 * Handler MSW de démonstration pour `GET /api/v1/campaigns` (T-57 : nom,
 * période, statut ; T-58 : filtre par statut via le paramètre contractuel
 * `status`). Pagination simple sur les fixtures ci-dessus ; la recherche par
 * nom (T-59) n'est pas encore gérée.
 */
export const campaignsHandlers = [
  http.get('/api/v1/campaigns', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? '20');
    const page = Number(url.searchParams.get('page') ?? '0');
    const status = url.searchParams.get('status') as CampaignStatus | null;
    const filtered = status
      ? demoCampaigns.filter((campaign) => campaign.status === status)
      : demoCampaigns;
    const start = page * size;
    const items = filtered.slice(start, start + size);

    return HttpResponse.json<CampaignPage>({
      items,
      page: {
        number: page,
        size,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      },
    });
  }),
];
