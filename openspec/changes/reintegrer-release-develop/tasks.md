## 1. Réintégration T-162

Périmètre : réintégrer dans `develop` les changements livrés sur `main` par la
release `v0.1.0`, sans modifier le comportement applicatif.

- [x] 1.1 [T-162] Vérifier le prérequis T-161, l'état Git et créer/réutiliser
      `infra/chore-162-reintegrer-main-develop` depuis `origin/develop`. (Branche
      créée depuis `origin/develop`, avec T-161 intégré comme prérequis de
      registre en attente de fusion.)
- [ ] 1.2 [T-162] Fusionner `origin/main` dans la branche de réintégration et
      résoudre les conflits en conservant les changements des deux branches.
- [ ] 1.3 [T-162] Vérifier le registre avec `node scripts/tickets.mjs check` et
      `node scripts/tickets.mjs verify T-162`.
- [ ] 1.4 [T-162] Exécuter les contrôles ciblés : tests du workflow Git, validation
      OpenSpec et validations applicatives disponibles.
- [ ] 1.5 [T-162] Vérifier l'ascendance et le diff final : `main` doit être
      ancêtre de la branche après la fusion, et aucun fichier hors périmètre ne
      doit être modifié intentionnellement.
- [ ] 1.6 [T-162] Commiter, pousser la branche et ouvrir une PR vers `develop`.
