# ai-capabilities Specification

## Purpose
TBD - created by archiving change skills-agents-multi-outils. Update Purpose after archive.
## Requirements
### Requirement: Discoverable skills in each supported client

Each repository Claude skill MUST expose identical instructions and resources to Codex and Copilot, including the `.agents/skills` discovery location for current Codex clients.

#### Scenario: Existing OpenSpec skills and senior review
- **WHEN** synchronization runs on the repository
- **THEN** all six skills and their referenced resources are discoverable through the documented provider locations
- **AND** the existing OpenSpec skill content remains unchanged

### Requirement: Explicit native agent adapters

Each repository Claude agent MUST have an explicit adapter generating the corresponding Codex TOML and Copilot Markdown profiles, with matching identity and instructions and provider-specific permissions.

#### Scenario: Reviewer profile
- **WHEN** the `code-reviewer` agent is synchronized
- **THEN** all providers expose the same review mission without a forced model
- **AND** the Codex profile uses a read-only sandbox

#### Scenario: Unknown agent or unsupported fields
- **WHEN** an agent lacks an adapter or contains unsupported Claude configuration
- **THEN** synchronization and parity checks fail with an actionable error instead of silently discarding configuration

### Requirement: Drift detection

The repository MUST provide a read-only parity check on PR and a local synchronization command covering entire skill trees and native agent profiles.

#### Scenario: Missing or changed resource
- **WHEN** a provider resource is missing, modified or obsolete
- **THEN** the parity check fails and identifies the affected path
- **AND** the check does not modify files

