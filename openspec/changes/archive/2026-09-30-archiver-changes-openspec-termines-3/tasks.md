## 1. T-153 (docs/chore-153-archiver-changes-openspec-termines-3)

Périmètre : archiver les cinq changes OpenSpec dont toutes les tâches sont
cochées et dont les PR sont fusionnées (aligner-espace-personnel,
harmoniser-responsive-composants, audit-refactorisation-sans-regression,
gerer-pluriels-interface, archiver-changes-openspec-termines-2) avec la CLI
`openspec archive`, en synchronisant leurs specs delta vers `openspec/specs/`.
Aucun code applicatif, aucun autre change touché.

- [x] 1.1 [T-153] Créer/réutiliser la branche
      `docs/chore-153-archiver-changes-openspec-termines-3` à partir de
      `origin/main`, sans modification étrangère embarquée.
- [x] 1.2 [T-153] Synchroniser les specs delta des quatre changes concernés vers
      `openspec/specs/` (nouvelles capacités ajoutées, desktop-sidebar-visual
      fusionné avec sa spec principale existante).
- [x] 1.3 [T-153] Archiver les cinq changes terminés avec
      `openspec archive <change> -y`, ce qui déplace chaque change vers
      `openspec/changes/archive/AAAA-MM-JJ-<change>/`.

## 2. Publication

- [x] 2.1 [T-153] Committer avec le message `docs(docs): T-153 archiver les
      changes openspec termines`, en ajoutant uniquement les fichiers de ce
      ticket.
- [x] 2.2 [T-153] Pousser la branche et ouvrir une PR vers `main` avec le
      modèle du dépôt, seulement si la livraison est explicitement demandée. PR #156 ouverte.
