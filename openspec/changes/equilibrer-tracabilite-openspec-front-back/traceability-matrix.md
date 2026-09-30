# Matrice de traçabilité front et back

Cette matrice décrit l'état local observable depuis la branche T-178. Elle ne
déduit pas l'état d'une PR distante à partir des cases OpenSpec. Les validations
et la présence d'une branche doivent être confirmées séparément avant livraison.

| Ticket | Change | Scope / type | Branche résolue | Artefacts attendus | État local de référence |
| --- | --- | --- | --- | --- | --- |
| T-167 | `formaliser-couche-domaine-backend` | back / chore | `back/chore-167-formaliser-couche-domaine-backend` | proposal, design, specs, tasks | planifié dans le registre |
| T-171 | `introduire-modele-domaine-backend` | back / refactor | `back/refactor-171-introduire-modele-domaine-backend` | proposal, design, specs, tasks | planifié dans le registre |
| T-172 | `isoler-client-api-frontend` | front / refactor | `front/refactor-172-isoler-client-api-frontend` | proposal, design, specs, tasks | planifié dans le registre |
| T-173 | `decomposer-repository-campagnes` | back / refactor | `back/refactor-173-decomposer-repository-campagnes` | proposal, design, specs, tasks | planifié dans le registre |
| T-174 | `separer-contrat-openapi-documentation` | docs / refactor | `docs/refactor-174-separer-contrat-openapi-documentation` | proposal, design, specs, tasks | planifié dans le registre |
| T-175 | `decoupler-doc-frontend-tickets` | docs / refactor | `docs/refactor-175-decoupler-doc-frontend-tickets` | proposal, design, specs, tasks | planifié dans le registre |
| T-176 | `definir-strategie-etat-frontend` | front / refactor | `front/refactor-176-definir-strategie-etat-frontend` | proposal, design, specs, tasks | change présent, avancement à contrôler par ses cases |
| T-177 | `rationaliser-generation-api-frontend` | fullstack / chore | `fullstack/chore-177-rationaliser-generation-api-frontend` | proposal, design, specs, tasks | planifié dans le registre |
| T-178 | `equilibrer-tracabilite-openspec-front-back` | docs / chore | `docs/chore-178-equilibrer-tracabilite-openspec-front-back` | proposal, design, specs, tasks, matrice | en cours sur cette branche |

## Règles de lecture

- `planifié dans le registre` ne signifie ni implémenté, ni fusionné.
- `change présent` indique seulement que les artefacts existent dans l'arbre
  local consulté ; il ne remplace pas une vérification de branche ou de PR.
- Les clients OpenAPI et autres fichiers générés restent des sorties contrôlées
  par leur source, pas des preuves autonomes de traçabilité.
