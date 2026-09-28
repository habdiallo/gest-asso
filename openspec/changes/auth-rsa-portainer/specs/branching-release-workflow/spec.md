## ADDED Requirements

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
