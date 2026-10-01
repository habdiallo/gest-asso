## ADDED Requirements

### Requirement: Réintégrer une release livrée dans develop

The workflow MUST reintegrate the content of a `release/vX.Y.Z` or
`hotfix/<description>` branch into `develop` through a dedicated PR after that
branch is merged into `main` and before the next delivery.

#### Scenario: Release fusionnée dans main

- **WHEN** la release `v0.1.0` est présente dans `main` et que `develop` contient
  des commits ultérieurs
- **THEN** une PR de réintégration de `main` vers `develop` est ouverte sans
  écraser les commits propres à `develop`

#### Scenario: Historique réintégré

- **WHEN** la PR de réintégration est fusionnée
- **THEN** le commit de production de `main` est ancêtre de `develop`

### Requirement: Contrôle du flux

The reintegration branch MUST respect the naming checks and target `develop`.

#### Scenario: Branche de ticket vers develop

- **WHEN** `infra/chore-162-reintegrer-main-develop` cible `develop`
- **THEN** le contrôle `Workflow conventions` réussit
