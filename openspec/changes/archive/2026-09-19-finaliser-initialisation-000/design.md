## Context

Depuis l'adoption du registre (`numerotation-tickets-branches`), `openspec/tickets.json` porte
un drapeau `initializationActive` consulté par `scripts/tickets.mjs` pour choisir entre
`branchDuringInitialization` (`<scope>/<type>-000-<description>`) et
`branchAfterInitialization` (`<scope>/<type>-<numero>-<description>`). En parallèle, les hooks
Git (`.githooks/pre-commit`, `.githooks/pre-push`), le contrôle CI
(`.github/workflows/workflow-conventions.yml`) et le script de parité IA
(`scripts/sync-ai-capabilities.mjs`) valident les noms de branche avec leur propre expression
régulière, dupliquant l'alternative `(000|[1-9][0-9]*)`. Le mainteneur a maintenant déclaré
l'initialisation terminée.

## Goals / Non-Goals

**Goals:**
- Retirer l'alternative `000` de tous les points d'application (hooks, CI, script de parité) de
  façon cohérente, sans laisser un seul endroit encore permissif.
- Faire passer `scripts/tickets.mjs` en résolution `branchAfterInitialization` pour tous les
  tickets, via le seul changement du drapeau `initializationActive` (aucune logique de résolution
  à modifier, elle est déjà conditionnelle sur ce drapeau).
- Renommer la seule branche `000` encore ouverte et non fusionnée (`front/feat-000-jetons-design`,
  T-1, PR #7) avant de retirer l'exception, conformément à CONTRIBUTING.md.
- Mettre à jour toute la documentation vivante décrivant l'exception comme active.

**Non-Goals:**
- Ne pas modifier rétroactivement les commits ou branches déjà fusionnés sous `000` (historique
  préservé tel quel, y compris les trois étapes frontend et les changes d'initialisation).
- Ne pas renuméroter ou réattribuer un ticket existant.
- Ne pas toucher au contenu des changes OpenSpec déjà archivés/historiques
  (`initialisation-front-features`, `skills-agents-multi-outils`,
  `numerotation-tickets-branches`) au-delà de cocher les deux tâches de bookkeeping déjà
  satisfaites par une PR réellement fusionnée.

## Decisions

- **Retirer `000` de la regex plutôt que la rendre conditionnelle à une variable d'environnement** :
  les hooks et la CI n'ont aucun mécanisme fiable pour connaître dynamiquement
  `initializationActive` (les hooks sont locaux, la CI n'a pas accès à un état partagé garanti à
  jour) ; la source de vérité du drapeau reste `openspec/tickets.json`, consulté uniquement par
  `scripts/tickets.mjs` pour la résolution de branche métier. Les hooks/CI, eux, se contentent
  d'un contrôle syntaxique de nom de branche : après la décision du mainteneur, cette syntaxe ne
  doit plus jamais accepter `000`, un retrait en dur est donc correct et plus simple qu'un flag.
- **Un seul commit/PR pour tous les points d'application** plutôt que des PR séparées par fichier :
  laisser un sous-ensemble des hooks/CI encore permissif au marqueur `000` pendant qu'un autre l'a
  déjà retiré créerait une fenêtre où une branche `000` passerait certains contrôles et pas
  d'autres, une incohérence pire que le risque d'un diff plus large.
- **Renommer `front/feat-000-jetons-design` avant de fusionner ce change** : une fois l'exception
  retirée des hooks, un `git push` sur cette branche serait refusé par le hook mis à jour (elle ne
  correspond plus au pattern), bloquant sa propre PR #7. Le renommage doit donc précéder ou
  accompagner ce change, pas le suivre.
- **Ne pas archiver les changes historiques `000`** : CONTRIBUTING.md distingue l'archivage
  (déclenché quand les tâches prévues d'un change sont terminées) du simple cochage d'une case de
  bookkeeping déjà vraie (PR déjà fusionnée). Ce change corrige uniquement l'état des cases, sans
  lancer d'archivage, qui reste une décision et une PR séparées si le mainteneur le souhaite.

## Risks / Trade-offs

- [Une branche `000` encore ouverte ailleurs (poste d'un autre contributeur, non visible ici)
  serait bloquée par le hook de push après ce change] → Le dépôt n'a qu'un mainteneur ; vérifié
  qu'aucune autre branche distante ne porte `000` avant de fusionner (`git ls-remote`).
- [Un test de `tests/git-workflow.test.cjs` non mis à jour laisserait passer un régression] →
  Retirer explicitement le test dédié à l'exception `000` et purger les branches `000` des listes
  de cas acceptés dans les autres tests, plutôt que les laisser accidentellement toujours verts.
- [Documentation vivante oubliée continuant de mentionner `000` comme actif] → Lister
  explicitement tous les fichiers concernés dans la proposition et les traiter dans une seule
  passe de ce change.
