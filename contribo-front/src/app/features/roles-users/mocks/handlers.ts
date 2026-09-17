import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, UserRole } from '@api';
import type {
  ErrorResponse,
  UpdateUserAccessRequest,
  UserAccount,
  UserAccountPage,
  UserRole as UserRoleType,
} from '@api';
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

const USER_ROLES: readonly UserRoleType[] = [
  UserRole.Administrator,
  UserRole.Treasurer,
  UserRole.Operator,
  UserRole.Member,
];

function isUpdateUserAccessRequest(value: unknown): value is UpdateUserAccessRequest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return (
    Object.keys(body).every((key) => key === 'role' || key === 'operatorCanRecordPayments') &&
    typeof body['role'] === 'string' &&
    USER_ROLES.includes(body['role'] as UserRoleType) &&
    typeof body['operatorCanRecordPayments'] === 'boolean'
  );
}

/**
 * Applique un changement de rôle applicatif (US-ROLE-001, T-53) et/ou de
 * l'attribut `peut_enregistrer_paiements` (T-55) à un compte de démonstration :
 * mute l'entrée trouvée dans `accounts` (état en mémoire du worker MSW, sans
 * backend) puis retourne le `UserAccount` résultant. Fait respecter la
 * contrainte du contrat : `operatorCanRecordPayments` doit valoir `false`
 * pour tout rôle différent de OPERATOR (T-56, masquage complet du contrôle
 * hors de cette fiche, reste hors périmètre).
 */
export function applyUserAccessUpdate(
  accounts: readonly DemoAccount[],
  userId: string,
  request: UpdateUserAccessRequest,
): { status: 200; account: UserAccount } | { status: 400 } | { status: 404 } {
  const demoAccount = accounts.find((account) => account.user.userId === userId);
  if (!demoAccount) {
    return { status: 404 };
  }
  if (request.role !== UserRole.Operator && request.operatorCanRecordPayments) {
    return { status: 400 };
  }

  demoAccount.user.role = request.role;
  demoAccount.user.operatorCanRecordPayments = request.operatorCanRecordPayments;
  return { status: 200, account: toUserAccount(demoAccount) };
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

  /**
   * `PUT /api/v1/users/{userId}` (`updateUserAccess`, T-53) : attribution d'un
   * rôle applicatif, réservée à l'Administrateur (RG-ROLE-002).
   */
  http.put('/api/v1/users/:userId', async ({ request, params }): Promise<Response> => {
    await delay(150);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    if (account.user.role !== UserRole.Administrator) {
      return accessDenied();
    }

    const body: unknown = await request.json().catch(() => null);
    if (!isUpdateUserAccessRequest(body)) {
      return HttpResponse.json<ErrorResponse>(
        { code: ErrorCode.ValidationError, message: 'Rôle applicatif invalide.' },
        { status: 400 },
      );
    }

    const userId = String(params['userId']);
    const result = applyUserAccessUpdate(demoAccounts, userId, body);
    if (result.status === 404) {
      return HttpResponse.json<ErrorResponse>(
        { code: ErrorCode.ResourceNotFound, message: 'Utilisateur introuvable.' },
        { status: 404 },
      );
    }
    if (result.status === 400) {
      return HttpResponse.json<ErrorResponse>(
        {
          code: ErrorCode.InvalidOperatorConfiguration,
          message: "operatorCanRecordPayments doit être false pour un rôle différent d'Opérateur.",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json<UserAccount>(result.account);
  }),
];
