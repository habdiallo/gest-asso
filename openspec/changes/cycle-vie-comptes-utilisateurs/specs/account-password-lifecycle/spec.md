## ADDED Requirements

### Requirement: Temporary credentials are provisioned once

The backend SHALL create a temporary password for every new member account and
for every administrator-triggered credential reset. It SHALL store only a
password hash, SHALL mark the account as requiring a password change, and SHALL
return the identifier and temporary password exactly once in the creation or
reset response.

#### Scenario: Member creation returns temporary credentials

- **WHEN** an Administrator or Treasurer creates a valid member
- **THEN** the backend creates the member and its `MEMBER` account atomically,
  marks `mustChangePassword` as true, and returns the identifier and temporary
  password in the creation response

#### Scenario: Subsequent member reads do not reveal the password

- **WHEN** an authorized user reads the created member, its account, or a page
  of members
- **THEN** the response contains no temporary password or password hash

#### Scenario: Temporary credential generation fails safely

- **WHEN** the backend cannot persist the member and account in the same
  transaction
- **THEN** it rolls back the creation and does not return or log a temporary
  password

### Requirement: Password change is mandatory after temporary authentication

The authentication service SHALL identify accounts whose password change is
required. It SHALL issue a restricted session for such accounts, reject normal
application operations with `PASSWORD_CHANGE_REQUIRED`, and allow only the
password change, minimal session lookup, CSRF and logout operations until the
password is changed.

#### Scenario: Temporary login opens the restricted flow

- **WHEN** a user authenticates with valid credentials while
  `mustChangePassword` is true
- **THEN** the API returns a session marked as password-change-only and the
  frontend directs the user to the mandatory password change screen

#### Scenario: Restricted session cannot access business data

- **WHEN** a password-change-only session calls a business endpoint
- **THEN** the backend refuses the request with the stable
  `PASSWORD_CHANGE_REQUIRED` error code

#### Scenario: New password creates a normal session

- **WHEN** the authenticated user submits a valid new password and its
  confirmation matches in the frontend
- **THEN** the backend stores only the new hash, clears `mustChangePassword`,
  invalidates the restricted session, and issues a normal authenticated session

#### Scenario: Password policy is enforced by the backend

- **WHEN** the submitted new password violates the configured length or content
  policy
- **THEN** the API rejects it without changing the stored password or the
  password-change-required state

### Requirement: Existing accounts are migrated to the activation lifecycle

The database migration SHALL add the password-change-required state and SHALL
mark existing user accounts as requiring a password change. All future account
creation paths SHALL initialize the same state explicitly.

#### Scenario: Existing user signs in after migration

- **WHEN** an existing Administrator, Treasurer, Operator or Member signs in
  after the migration with the existing valid password
- **THEN** the user receives the restricted session and must choose a new
  password before accessing business data

#### Scenario: New account defaults are explicit

- **WHEN** a new account is created by member provisioning, bootstrap or reset
- **THEN** the account is active only according to its existing account rules,
  has a stored password hash, and has password change required

### Requirement: The first administrator can be bootstrapped safely

The backend SHALL support an idempotent post-migration bootstrap controlled by
`BOOTSTRAP_ADMIN_ENABLED` and a Docker secret file. On an empty database it SHALL
create the required association data, member and Administrator account with a
password-change-required state. It SHALL never replace the password or role of
an existing account on restart.

#### Scenario: Empty database bootstrap succeeds

- **WHEN** bootstrap is enabled and the configured identifier and secret file
  are present after migrations on an empty database
- **THEN** the backend creates one Administrator account with a hashed
  temporary password and the first login requires a password change

#### Scenario: Bootstrap is idempotent

- **WHEN** the application restarts after the bootstrap account already exists
- **THEN** the backend performs no password reset, duplicate creation or role
  change

#### Scenario: Incomplete bootstrap configuration fails clearly

- **WHEN** bootstrap is enabled but a required identifier, secret file or
  association setting is missing
- **THEN** startup fails with a diagnostic that does not include the secret

### Requirement: Administrators can regenerate a lost temporary password

The backend SHALL expose an Administrator-only credential reset operation. The
operation SHALL generate a new temporary password, invalidate the old password,
mark password change required, revoke known sessions and return the new secret
only in that response.

#### Scenario: Administrator resets a member credential

- **WHEN** an Administrator requests a reset for a user account in the same
  association
- **THEN** the backend returns a new temporary password once and the next login
  enters the restricted password-change flow

#### Scenario: Non-administrator cannot reset credentials

- **WHEN** a Treasurer, Operator, Member or unauthenticated caller requests a
  credential reset
- **THEN** the backend refuses the operation without revealing account details

#### Scenario: Reset does not expose the old password

- **WHEN** an Administrator completes a credential reset
- **THEN** the old password is not returned, logged or recoverable from the API
