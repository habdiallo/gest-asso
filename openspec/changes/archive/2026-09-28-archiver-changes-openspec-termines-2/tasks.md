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
- [x] 2.2 [T-136] Pousser la branche
      `docs/chore-136-archiver-changes-openspec-termines-2` et ouvrir une PR
      vers `main` avec le modèle du dépôt, seulement si la livraison est
      explicitement demandée. PR #135 ouverte.

## 3. Extension : neuvième change désormais terminé

Périmètre : depuis l'ouverture de la PR #135, `harmonisation-boutons-tableaux-select`
(T-126) a vu ses deux dernières tâches cochées par la PR #141 fusionnée sur
`main`. Toutes ses tâches sont donc désormais cochées ; l'archiver à son tour
sous ce même ticket T-136, sans rouvrir un nouveau ticket, avant fusion de la
PR #135.

- [x] 3.1 [T-136] Synchroniser la branche avec `origin/main` (fusion) pour
      récupérer la finalisation de T-126 et les autres tickets fusionnés
      depuis l'ouverture de la PR #135.
- [x] 3.2 [T-136] Archiver `harmonisation-boutons-tableaux-select` avec
      `openspec archive harmonisation-boutons-tableaux-select -y`, ce qui le
      déplace vers `openspec/changes/archive/AAAA-MM-JJ-<change>/` et
      synchronise sa spec delta `composants-interaction-visual` vers
      `openspec/specs/`.
- [x] 3.3 [T-136] Committer cette extension et pousser la branche mise à jour
      sur la PR #135 déjà ouverte.
