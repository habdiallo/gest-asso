# senior-code-review Specification

## Purpose
TBD - created by archiving change skills-agents-multi-outils. Update Purpose after archive.
## Requirements
### Requirement: Evidence-based review

The senior review skill MUST examine the requested diff, its callers and relevant project requirements, report only demonstrated introduced defects, and state actual validation limits.

#### Scenario: Confirmed regression
- **WHEN** a changed line violates an established invariant under a concrete reachable scenario
- **THEN** the finding includes severity, file and line, trigger, evidence, impact and a suggested correction

#### Scenario: No demonstrated issue
- **WHEN** investigation finds only preferences, speculative risks or missing tests without a demonstrated defect
- **THEN** the report contains no invented finding and explains its review coverage and limits

### Requirement: Project-specific and non-mutating review

The skill MUST respect feature-based frontend architecture and reserve hexagonal architecture for the future backend. A review invocation MUST NOT authorize edits, commits, pushes or remote review publication.

#### Scenario: Frontend review
- **WHEN** the diff affects `contribo-front`
- **THEN** the reviewer reads applicable frontend rules and checks `features/core/shared` boundaries
- **AND** it does not require SSR, Transloco or an unavailable design system

#### Scenario: Local verdict
- **WHEN** the reviewer produces its verdict
- **THEN** it remains a local report without a GitHub approval, comment, merge or code correction

