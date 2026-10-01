## 1. Réintégration T-162

Périmètre : réintégrer dans `develop` les changements livrés sur `main` par la
release `v0.1.0`, sans modifier le comportement applicatif.

- [x] 1.1 [T-162] Vérifier le prérequis T-161, l'état Git et créer/réutiliser
      `infra/chore-162-reintegrer-main-develop` depuis `origin/develop`. (Branche
      créée depuis `origin/develop`, avec T-161 intégré comme prérequis de
      registre en attente de fusion.)
- [x] 1.2 [T-162] Fusionner `origin/main` dans la branche de réintégration et
      résoudre les conflits en conservant les changements des deux branches.
      (Commit de merge `313885a`; les changes déjà archivés par T-161 restent
      dans `openspec/changes/archive/`.)
- [x] 1.3 [T-162] Vérifier le registre avec `node scripts/tickets.mjs check` et
      `node scripts/tickets.mjs verify T-162`. (Contrôles réussis après la
      résolution.)
- [x] 1.4 [T-162] Exécuter les contrôles ciblés : tests du workflow Git, validation
      OpenSpec et validations applicatives disponibles. (`node --test
      tests/git-workflow.test.cjs`, `node --test tests/tickets.test.mjs`,
      `openspec validate reintegrer-release-develop --type change --strict` et
      `openspec validate --specs --strict` réussissent.)
- [x] 1.5 [T-162] Vérifier l'ascendance et le diff final : `main` doit être
      ancêtre de la branche après la fusion, et aucun fichier hors périmètre ne
      doit être modifié intentionnellement. (`git merge-base --is-ancestor
      origin/main HEAD` réussit ; les différences applicatives sont celles déjà
      présentes sur `develop`, et les changements T-162 sont limités à la
      traçabilité OpenSpec et à l'ascendance Git.)
- [x] 1.6 [T-162] Commiter, pousser la branche et ouvrir une PR vers `develop`.
      (PR #170 ouverte en brouillon, dépendante de la PR #169.)
