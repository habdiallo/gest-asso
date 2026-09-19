## MODIFIED Requirements

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
