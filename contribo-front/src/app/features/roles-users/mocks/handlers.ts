import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, UserRole } from '@api';
import type { ErrorResponse, UserAccount, UserAccountPage, UserRole as UserRoleType } from '@api';
import type { DemoAccount } from '../../../../mocks/demo-accounts';
import { demoAccounts, findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

function toUserAccount(account: DemoAccount): UserAccount {
  return {
    id: account.user.userId,
    role: account.user.role,
    operatorCanRecordPayments: account.user.operatorCanRecordPayments,
    active: account.user.accountActive,
    member: {
      id: account.user.member.id,
      displayName: account.user.member.displayName,
    },
  };
}

/**
 * Construit la page `/users` (T-52) à partir des comptes de démonstration,
 * en appliquant la recherche (`q`, insensible à la casse sur le nom affiché)
 * et le filtre de rôle (`role`) du contrat, puis la pagination `page`/`size`.
 * Extraite du handler MSW pour être testée directement.
 */
export function buildUserAccountsPage(
  accounts: readonly DemoAccount[],
  page: number,
  size: number,
  q?: string,
  role?: UserRoleType,
): UserAccountPage {
  const normalizedQuery = q?.trim().toLowerCase();
  const filtered = accounts
    .map((account) => toUserAccount(account))
    .filter((account) => (role ? account.role === role : true))
    .filter((account) =>
      normalizedQuery ? account.member.displayName.toLowerCase().includes(normalizedQuery) : true,
    );

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const items = filtered.slice(page * size, page * size + size);

  return {
    items,
    page: { number: page, size, totalElements, totalPages },
  };
}

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

function accessDenied(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AccessDenied, message: 'Accès réservé à l’Administrateur.' },
    { status: 403 },
  );
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/users` (T-52), réservé à
 * l'Administrateur (RG-ROLE-002) : un autre rôle authentifié reçoit un 403,
 * conformément au contrat (`listUsers`, réponse `Forbidden`).
 */
export const rolesUsersHandlers = [
  http.get('/api/v1/users', async ({ request }): Promise<Response> => {
    await delay(150);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    if (account.user.role !== UserRole.Administrator) {
      return accessDenied();
    }

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '20');
    const q = url.searchParams.get('q') ?? undefined;
    const role = (url.searchParams.get('role') as UserRoleType | null) ?? undefined;

    return HttpResponse.json<UserAccountPage>(
      buildUserAccountsPage(demoAccounts, page, size, q, role),
    );
  }),
];
