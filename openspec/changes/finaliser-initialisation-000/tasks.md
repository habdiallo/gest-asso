## 1. Ticket T-106 — Préparation (infra, chore)

Ticket : T-106. Scope `infra`, type `chore`. Ce ticket incarne lui-même la fin de
l'initialisation : sa branche utilise directement le numéro réel, `infra/chore-106-fin-initialisation-000`,
sans passer par `000`. Périmètre : retirer l'exception `000` des hooks, de la CI, du script de
parité IA et des tests associés ; mettre à jour la documentation vivante ; renommer la seule
branche `000` encore ouverte. Critères d'acceptation : plus aucune regex active n'accepte `000` ;
`node --test tests/git-workflow.test.cjs` passe ; `openspec/tickets.json` a
`initializationActive: false` ; la PR #7 (T-1) est repointée sur une branche conforme.

- [x] 1.1 [T-106] Vérifier `git status --short` et la branche courante, confirmer l'absence
      d'autre branche distante `*-000-*` non fusionnée (`git ls-remote --heads origin`).
- [x] 1.2 [T-106] Renommer localement et à distance `front/feat-000-jetons-design` en
      `front/feat-1-jetons-design`, et mettre à jour la PR #7 (titre/branche) en conséquence.

## 2. Ticket T-106 — Hooks, CI et script de parité

- [x] 2.1 [T-106] Retirer l'alternative `(000|...)` de la regex dans `.githooks/pre-commit` et
      `.githooks/pre-push`.
- [x] 2.2 [T-106] Retirer l'alternative `(000|...)` de la regex dans
      `.github/workflows/workflow-conventions.yml`.
- [x] 2.3 [T-106] Retirer `000` de la regex de branche autorisée pour `--write` dans
      `scripts/sync-ai-capabilities.mjs`.

## 3. Ticket T-106 — Registre et tests

- [x] 3.1 [T-106] Passer `initializationActive` à `false` dans `openspec/tickets.json`.
- [x] 3.2 [T-106] Cocher les deux tâches de bookkeeping déjà satisfaites (PR fusionnées) dans
      `openspec/changes/skills-agents-multi-outils/tasks.md` et
      `openspec/changes/numerotation-tickets-branches/tasks.md`.
- [x] 3.3 [T-106] Mettre à jour `tests/git-workflow.test.cjs` : retirer le test dédié à
      l'exception `000` et purger les branches `000` des listes de cas acceptés/refusés.
- [x] 3.4 [T-106] Exécuter `node --test tests/git-workflow.test.cjs`,
      `node --test tests/tickets.test.mjs` et `node scripts/tickets.mjs check`.

## 4. Ticket T-106 — Documentation vivante

- [x] 4.1 [T-106] Mettre à jour `AGENTS.md`, `CONTRIBUTING.md` et `.claude/rules/git-workflow.md`
      pour refléter la fin de l'exception `000` (sans réécrire l'historique déjà livré).
- [x] 4.2 [T-106] Mettre à jour `AI-WORKFLOW.md`, `README.md`, `.github/copilot-instructions.md`,
      `.github/pull_request_template.md`, `openspec/config.yaml` et `openspec/TICKETS.md`.
- [x] 4.3 [T-106] Exécuter `node scripts/sync-ai-capabilities.mjs --check` pour vérifier la parité
      Claude/Codex/Copilot après ces mises à jour.
- [x] 4.4 [T-106] [P2, revue senior PR #9] Mettre à jour
      `.claude/skills/code-review-senior/references/context.md` (« Livraison » décrivait encore
      `000` comme actif) puis propager avec `node scripts/sync-ai-capabilities.mjs --write` vers
      `.codex/` et `.github/`.

## 5. Ticket T-106 — Publication (PR vers main)

- [x] 5.1 [T-106] Committer les fichiers du ticket avec le message `chore(infra): T-106 ...`,
      sans embarquer d'autres changements.
- [x] 5.2 [T-106] Pousser `infra/chore-106-fin-initialisation-000` et ouvrir une PR en brouillon
      vers `main`, en référençant T-106 et ce change OpenSpec.
- [ ] 5.3 [T-106] Ne pas fusionner ni activer l'auto-merge sans demande explicite de l'utilisateur.
