# ci-image-publishing Specification

## Purpose
TBD - created by archiving change auth-rsa-portainer. Update Purpose after archive.
## Requirements
### Requirement: La CI teste l'authentification avec une paire éphémère

Le workflow SHALL générer une paire RSA temporaire pour les tests backend et SHALL ne jamais versionner ni publier cette paire.

#### Scenario: Job backend

- **WHEN** le job backend démarre
- **THEN** il génère une paire RSA de test avant Maven et l'utilise uniquement pendant le job

### Requirement: Les images publiées sont versionnées

Le workflow SHALL publier les images backend et frontend sous des tags versionnés dérivés de l'historique de `main`, SHALL publier un alias d'intégration depuis `develop` et SHALL conserver un alias de production documenté.

#### Scenario: Publication après main

- **WHEN** un changement validé est poussé sur `main`
- **THEN** les tests backend/frontend passent avant la publication et les deux images sont poussées avec le même numéro de version

#### Scenario: Publication de l'intégration

- **WHEN** un changement validé est poussé sur `develop`
- **THEN** les deux images sont poussées avec `latest-int` et un tag SHA du commit

#### Scenario: Publication de la production

- **WHEN** un commit de production est poussé sur `main`
- **THEN** les deux images sont poussées avec `latest` et un tag SHA, sans publier de clé RSA

