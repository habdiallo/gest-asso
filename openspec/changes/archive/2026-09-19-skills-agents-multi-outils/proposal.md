## Why

La revue senior de l'ancien projet dépend de conventions et de points d'entrée Claude qui ne correspondent pas tous à ce dépôt. Les capacités de développement doivent être accessibles avec Claude, Codex et Copilot sans dérive entre leurs consignes.

## What Changes

- Adapter `code-review-senior` aux règles Contribo et à une revue fondée sur des défauts démontrés.
- Exposer les six skills du dépôt dans les emplacements des trois outils, y compris `.agents/skills` pour Codex actuel.
- Ajouter un agent `code-reviewer` avec des profils natifs et des restrictions propres aux outils.
- Fournir synchronisation, contrôle automatique de parité et documentation des invocations.

## Capabilities

### New Capabilities

- `ai-capabilities`: découverte, parité et invocation des skills et agents.
- `senior-code-review`: revue factuelle adaptée au projet, sans modification ni publication implicite.

### Modified Capabilities

Aucune.

## Impact

Ticket d'initialisation `000`, scope `infra`, type `chore`, branche `infra/chore-000-skills-agents-multi-outils`, PR vers `main`. Évolution d'outillage sans changement applicatif ni API. La branche part de l'initialisation frontend : intégrer les PR #2 puis #1 avant cette livraison, ou rebaser après leur intégration. Les skills générés OpenSpec restent inchangés.
