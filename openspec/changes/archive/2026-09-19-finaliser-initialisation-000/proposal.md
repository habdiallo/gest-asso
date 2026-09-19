## Why

Le mainteneur a déclaré terminée l'initialisation du projet (structure Angular validée,
registre de 105 tickets adopté, hooks/CI de conventions en place, skills/agents partagés
Claude/Codex/Copilot livrés). Le marqueur `000` et son exception de branche n'ont donc plus
lieu d'être pour les nouvelles évolutions ; CONTRIBUTING.md et AGENTS.md exigent explicitement
de retirer cette exception des règles, hooks, CI et tests dès cette décision prise, sans
modifier rétroactivement les commits déjà livrés sous `000`.

## What Changes

- Retirer l'alternative `(000|...)` des expressions régulières de validation de branche dans
  `.githooks/pre-commit`, `.githooks/pre-push`, `.github/workflows/workflow-conventions.yml` et
  `scripts/sync-ai-capabilities.mjs` (branche autorisée pour `--write`).
- Mettre à jour `tests/git-workflow.test.cjs` : retirer le test dédié à l'exception `000` et les
  cas de branches `000` des listes de branches acceptées/refusées.
- Passer `initializationActive` à `false` dans `openspec/tickets.json` ; cocher les deux tâches
  de bookkeeping déjà satisfaites (PR fusionnées) dans `skills-agents-multi-outils/tasks.md` et
  `numerotation-tickets-branches/tasks.md`.
- Renommer la branche `000` encore ouverte (`front/feat-000-jetons-design`, PR #7, ticket T-1)
  en `front/feat-1-jetons-design`, et mettre à jour la PR en conséquence.
- Mettre à jour la documentation vivante décrivant l'exception `000` comme active :
  `AGENTS.md`, `CONTRIBUTING.md`, `.claude/rules/git-workflow.md`, `AI-WORKFLOW.md`,
  `README.md`, `.github/copilot-instructions.md`, `.github/pull_request_template.md`,
  `openspec/config.yaml`, `openspec/TICKETS.md`.
- **BREAKING** (workflow local) : toute branche encore créée sous la forme `<scope>/<type>-000-<description>`
  sera refusée par les hooks et la CI après ce change ; seules les branches déjà fusionnées sous
  `000` restent inchangées dans l'historique.

## Capabilities

### New Capabilities
(aucune)

### Modified Capabilities
- `ticket-branch-mapping` : la phase d'initialisation n'est plus active ; la résolution de
  branche pour tout ticket utilise désormais systématiquement `branchAfterInitialization`, et les
  branches `<scope>/<type>-000-<description>` ne sont plus acceptées par les contrôles locaux et CI.

## Impact

- Fichiers d'application des règles : `.githooks/pre-commit`, `.githooks/pre-push`,
  `.github/workflows/workflow-conventions.yml`, `scripts/sync-ai-capabilities.mjs`.
- Tests : `tests/git-workflow.test.cjs`.
- Registre : `openspec/tickets.json` (`initializationActive`, deux cases de bookkeeping).
- Documentation vivante listée ci-dessus (AGENTS.md, CONTRIBUTING.md, règles Claude, gabarits).
- Une branche ouverte à renommer : `front/feat-000-jetons-design` → `front/feat-1-jetons-design`
  (PR #7).
- Aucun impact sur le contrat API, le code applicatif frontend ou le backend.
- Ticket local : T-106 (`infra/chore-106-fin-initialisation-000`), sans dépendance bloquante.
