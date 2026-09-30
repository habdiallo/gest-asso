## Why

Le backend utilise aujourd'hui les modèles OpenAPI générés comme représentation interne, alors que la documentation annonce une séparation domaine/adapters. Cette évolution traite le couplage backend de façon réelle, après T-167 qui ne fait que documenter l'état existant.

## What Changes

- Introduire des modèles métier backend indépendants du contrat HTTP.
- Ajouter les mappings entre modèles métier, DTO OpenAPI et lignes JDBC.
- Migrer progressivement les services, ports et repositories concernés.
- Préserver les chemins, schémas et comportements API existants.

## Capabilities

### New Capabilities

- `backend-domain-model`: représentation métier indépendante du transport et de la persistance.

### Modified Capabilities

- `backend-architecture-foundation`: remplacer l'exception documentaire par une séparation effectivement vérifiée.

## Impact

Backend uniquement, avec impacts sur `domain/`, `application/`, les ports, les repositories JDBC, les adapters REST et les tests. Aucun changement OpenAPI attendu.
