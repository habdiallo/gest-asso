## 1. T-136 (docs/chore-136-archiver-changes-openspec-termines-2)

Périmètre : archiver les huit changes OpenSpec dont toutes les tâches sont
cochées (enregistrer-contributeurs-externes-cagnotte, coherer-cycle-vie-campagne,
aligner-typographie-tableau-reglements, aligner-bareme-campagne-design,
harmonisation-actions-navigation-sidebar, historique-reglements-tableau-de-bord,
historique-reglements-tableau-de-bord-t127, frontend-tickets-mvp-association)
avec la CLI `openspec archive`, en synchronisant leurs specs delta vers
`openspec/specs/`. Aucun code applicatif, aucun autre change touché.

- [x] 1.1 [T-136] Créer/réutiliser la branche
      `docs/chore-136-archiver-changes-openspec-termines-2` à partir de
      `origin/main` (worktree dédié, aucune modification étrangère embarquée).
- [x] 1.2 [T-136] Synchroniser les specs delta des sept changes concernés vers
      `openspec/specs/` (nouvelles capacités ajoutées, desktop-sidebar-visual
      fusionné avec sa spec principale existante).
- [x] 1.3 [T-136] Archiver les huit changes terminés avec
      `openspec archive <change> -y`, ce qui déplace chaque change vers
      `openspec/changes/archive/AAAA-MM-JJ-<change>/`.

## 2. Publication

- [x] 2.1 [T-136] Committer avec le message `docs(docs): T-136 archiver les
      changes openspec termines` (ou équivalent conforme), en ajoutant
      uniquement les fichiers de ce ticket.
- [ ] 2.2 [T-136] Pousser la branche
      `docs/chore-136-archiver-changes-openspec-termines-2` et ouvrir une PR
      vers `main` avec le modèle du dépôt, seulement si la livraison est
      explicitement demandée.
