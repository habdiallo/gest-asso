## Why

Le backlog frontend comporte 104 éléments ouverts, identifiés uniquement par des numéros d'étapes OpenSpec comme `2.1`. Il manque une identité de ticket stable et une correspondance explicite avec la branche à sélectionner lors de l'implémentation.

## What Changes

- Attribuer à chaque évolution ouverte un numéro de ticket unique et stable, indépendant des US/RG et des étapes OpenSpec.
- Fournir un catalogue reliant ticket, titre, change, tâches, priorité, scope/type, description de branche et dépendances.
- Résoudre la branche d'implémentation depuis le ticket sélectionné, en conservant `000` comme marqueur de branche pendant l'initialisation.
- Prévoir la mise à jour des consignes communes et du contexte OpenSpec pour que Claude, Codex et Copilot sélectionnent la même branche.
- Préserver les tâches déjà réalisées et leurs branches/PR historiques ; ne pas réinitialiser leur statut.

## Capabilities

### New Capabilities

- `ticket-branch-mapping`: identité des tickets, correspondance avec le backlog et sélection de branche.

### Modified Capabilities

Aucune exigence applicative modifiée.

## Impact

Proposition documentaire sur `docs/chore-000-numerotation-tickets-branches`, ticket d'initialisation `000`. L'application du workflow sera une évolution `infra/chore-000-registre-tickets-branches`, avec sa PR vers `main`. Les 104 tickets métier resteront des évolutions frontend distinctes.

Les zones prévues sont le catalogue de tickets, le backlog `frontend-tickets-mvp-association`, `CONTRIBUTING.md`, `AGENTS.md`, `openspec/config.yaml` et un éventuel outil de résolution/contrôle. Aucun changement Angular, backend, API ou hook n'est implémenté par cette proposition. Les branches restent conformes aux contrôles existants.

Le tracker et l'attribution seront explicites : les numéros locaux, s'ils sont retenus, ne seront jamais présentés comme des issues GitHub. La proposition prépare la numérotation sans publier d'issues.

Catalogue local proposé : [tickets.md](tickets.md), avec 104 tickets `T-1` à `T-104` ; [tickets.json](tickets.json) porte les références exactes et les deux branches de chaque ticket. L'attribution devient la référence d'exécution après adoption lors de l'apply ; les consignes actuelles ne sont pas changées par cette proposition.
