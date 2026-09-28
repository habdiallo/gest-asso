## ADDED Requirements

### Requirement: La CI teste l'authentification avec une paire éphémère

Le workflow SHALL générer une paire RSA temporaire pour les tests backend et SHALL ne jamais versionner ni publier cette paire.

#### Scenario: Job backend

- **WHEN** le job backend démarre
- **THEN** il génère une paire RSA de test avant Maven et l'utilise uniquement pendant le job

### Requirement: Les images publiées sont versionnées

Le workflow SHALL publier les images backend et frontend sous des tags versionnés dérivés de l'historique de `main` et SHALL conserver un alias d'intégration documenté.

#### Scenario: Publication après main

- **WHEN** un changement validé est poussé sur `main`
- **THEN** les tests backend/frontend passent avant la publication et les deux images sont poussées avec le même numéro de version
