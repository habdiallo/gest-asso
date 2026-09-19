# ticket-branch-mapping Specification

## Purpose
TBD - created by archiving change numerotation-tickets-branches. Update Purpose after archive.
## Requirements
### Requirement: Stable repository ticket identity

The workflow MUST give each planned evolution a unique positive integer ticket identifier distinct from OpenSpec step numbers, user story identifiers and external issue numbers. Reordering or cancelling a ticket MUST NOT renumber existing tickets or reuse their identifiers.

#### Scenario: Initial frontend allocation
- **WHEN** the proposed catalogue is adopted against the current frontend backlog
- **THEN** its 104 open elements receive distinct ticket identifiers from 1 to 104
- **AND** the three completed initialization steps retain their existing 000 traceability and checked status

#### Scenario: Subsequent allocation
- **WHEN** a new frontend, backend, documentation or infrastructure evolution is planned
- **THEN** it receives the next unused repository identifier regardless of scope
- **AND** existing ticket identifiers remain unchanged

### Requirement: Explicit ticket catalogue

Each ticket MUST record its title and scope, priority, type, branch slug, source change and covered steps, dependencies and planning status. Local identifiers MUST NOT imply that a corresponding GitHub issue exists.

#### Scenario: Ticket lookup
- **WHEN** a developer selects T-1
- **THEN** the catalogue identifies frontend step 1.3 and its design-token evolution without confusing it with OpenSpec step 1.1 or GitHub issue 1

#### Scenario: Invalid catalogue
- **WHEN** tickets duplicate identifiers, reference missing steps/dependencies, form a dependency cycle or declare inconsistent branch names
- **THEN** validation fails with the affected ticket and no branch or code is generated

### Requirement: Phase-aware branch selection

Before implementation, the workflow MUST select exactly one ticket and resolve its dedicated
branch from its scope, type, slug and initialization phase. The initialization phase remains
active only until the maintainer explicitly ends it; once ended, every ticket resolves to its
`branchAfterInitialization` value, and branch names of the form
`<scope>/<type>-000-<description>` MUST be refused by local hooks, CI and the AI capability
parity script alike.

#### Scenario: Design tokens during initialization
- **WHEN** T-1 was selected while initialization was still active
- **THEN** its branch was `front/feat-000-jetons-design`
- **AND** its report and PR retained the local identity T-1 without using `Closes #000`

#### Scenario: Design tokens after initialization
- **WHEN** T-1 is selected after the maintainer ends initialization and this change is merged
- **THEN** its branch is `front/feat-1-jetons-design`
- **AND** the change remains tied to the same ticket and steps

#### Scenario: Rejected 000 branch after initialization
- **WHEN** a commit, push, pull request or `sync-ai-capabilities.mjs --write` targets a branch
  named `<scope>/<type>-000-<description>` after this change is merged
- **THEN** the local hooks, the `Workflow conventions` CI check and the sync script all refuse it,
  independently of one another

#### Scenario: Unknown selection or different branch
- **WHEN** the ticket is unknown, ambiguous, or the current branch belongs to another evolution
- **THEN** implementation stops before code generation and reports the expected ticket and branch

### Requirement: Independent implementation and delivery

Claude, Codex and Copilot MUST use the same catalogue and shared rules to select ticket tasks and validate dependencies. Each implemented evolution MUST be delivered by its own PR targeting main, without direct pushes to main.

#### Scenario: Selected ticket implementation
- **WHEN** an apply request names one ticket in a change containing multiple tickets
- **THEN** only its mapped steps and required validation are implemented on its resolved branch
- **AND** unrelated tasks remain unchanged

#### Scenario: Planning proposal only
- **WHEN** this proposal is generated
- **THEN** the catalogue and artifacts are prepared without creating application branches, implementing frontend code, publishing GitHub issues or ending initialization

