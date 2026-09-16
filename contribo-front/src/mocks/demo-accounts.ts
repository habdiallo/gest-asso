import { CurrencyCode, MemberStatus, UserRole } from '@api';
import type { CurrentUser, LoginRequest } from '@api';

export interface DemoAccount {
  readonly identifier: string;
  readonly password: string;
  readonly accessToken: string;
  readonly user: CurrentUser;
}

const profiles = [
  ['admin.demo', UserRole.Administrator, false, 'Awa', 'Camara'],
  ['tresorier.demo', UserRole.Treasurer, false, 'Moussa', 'Barry'],
  ['operateur.demo', UserRole.Operator, true, 'Fatou', 'Sow'],
  ['operateur.consultation.demo', UserRole.Operator, false, 'Ibrahima', 'Bah'],
  ['membre.demo', UserRole.Member, false, 'Mariama', 'Diallo'],
] as const;

/** Fixtures exclusivement chargées par l'entrée mock ; aucune session mutable dans MSW. */
export const demoAccounts: readonly DemoAccount[] = profiles.map(
  ([identifier, role, operatorCanRecordPayments, firstName, lastName], index) => ({
    identifier,
    password: 'demo-contribo',
    accessToken: `contribo-demo-session-${identifier}-v1`,
    user: {
      userId: `10700000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      association: {
        id: '10700000-0000-4000-8000-000000000100',
        name: 'Association Démo',
        currency: CurrencyCode.Gnf,
      },
      member: {
        id: `10700000-0000-4000-8000-${String(index + 11).padStart(12, '0')}`,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        status: MemberStatus.Active,
      },
      role,
      operatorCanRecordPayments,
      accountActive: true,
    },
  }),
);

export function isLoginRequest(value: unknown): value is LoginRequest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return (
    Object.keys(body).every((key) => key === 'identifier' || key === 'password') &&
    typeof body['identifier'] === 'string' &&
    body['identifier'].length >= 1 &&
    Array.from(body['identifier']).length <= 150 &&
    typeof body['password'] === 'string' &&
    body['password'].length >= 1 &&
    Array.from(body['password']).length <= 200
  );
}

export function findDemoAccount(credentials: LoginRequest): DemoAccount | undefined {
  return demoAccounts.find(
    (account) =>
      account.identifier === credentials.identifier && account.password === credentials.password,
  );
}

export function findDemoAccountByAuthorization(
  authorization: string | null,
): DemoAccount | undefined {
  const match = /^Bearer ([^\s]+)$/i.exec(authorization ?? '');
  return match ? demoAccounts.find((account) => account.accessToken === match[1]) : undefined;
}
