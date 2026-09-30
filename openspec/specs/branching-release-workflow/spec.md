# branching-release-workflow Specification

## Purpose
TBD - created by archiving change auth-rsa-portainer. Update Purpose after archive.
## Requirements
### Requirement: Les PR de ticket ciblent l'intégration

Une branche conforme à un ticket SHALL ouvrir sa PR vers `develop`. Les branches
`main` et `develop` SHALL être protégées et ne SHALL pas recevoir de push direct.

#### Scenario: PR d'un ticket

- **WHEN** une branche `<scope>/<type>-<ticket>-<description>` est proposée
- **THEN** sa cible est `develop` et le contrôle de conventions l'accepte

### Requirement: Les releases et hotfixes ciblent la production

Une branche `release/vX.Y.Z` SHALL être créée depuis `develop` et proposer sa PR
vers `main`. Une branche `hotfix/<description>` SHALL être créée depuis `main`,
proposer sa PR vers `main`, puis être réintégrée dans `develop` après fusion.

#### Scenario: Promotion d'une release

- **WHEN** `release/vX.Y.Z` est stabilisée et validée
- **THEN** sa PR vers `main` est acceptée et la release est ensuite réintégrée dans `develop`

### Requirement: contrôler les cibles selon le type de branche

The `Workflow conventions` workflow MUST accept a ticket branch targeting
`develop`, a `release/vX.Y.Z` branch targeting `main`, and a `hotfix/*` branch
targeting `main`.

#### Scenario: ticket vers develop

- **Étant donné** une branche `front/feat-123-ajout-membre`
- **Quand** la cible est `develop`
- **Alors** le contrôle réussit

#### Scenario: release vers main

- **Étant donné** une branche `release/v1.2.3`
- **Quand** la cible est `main`
- **Alors** le contrôle réussit

#### Scenario: hotfix vers main

- **Étant donné** une branche `hotfix/corriger-login`
- **Quand** la cible est `main`
- **Alors** le contrôle réussit

#### Scenario: ticket vers main

- **Étant donné** une branche de ticket conforme
- **Quand** la cible est `main`
- **Alors** le contrôle échoue

#### Scenario: promotion bootstrap vers main

- **Étant donné** la branche dédiée `infra/chore-156-activer-flux-release`
- **Quand** la cible est `main`
- **Alors** le contrôle réussit uniquement pour cette transition

### Requirement: refuser les noms non conformes

The control MUST reject provisional branches, zero or zero-prefixed numbers,
non-conforming names, and inputs attempting shell injection.

The bootstrap exception MUST remain limited to the exact T-156 branch name.

#### Scenario: branche provisoire

- **Étant donné** une branche `docs/chore-local-workflow`
- **Quand** la cible est `develop`
- **Alors** le contrôle échoue

