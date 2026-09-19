## 1. T-115 (docs/chore-115-archiver-changes-openspec-termines)

Périmètre : archiver les dix changes OpenSpec dont toutes les tâches sont
cochées (ajouter-environment-angular, corriger-demarrage-mock,
corriger-filtre-evenement-cagnottes, corriger-regle-i18n-transloco,
fidelite-sidebar-desktop-design, initialisation-front-features,
interdire-tiret-cadratin-regles, mocks-msw-client-api,
numerotation-tickets-branches, skills-agents-multi-outils) avec la CLI
`openspec archive`. Aucun code applicatif, aucun autre change touché.

- [x] 1.1 [T-115] Créer/réutiliser la branche
      `docs/chore-115-archiver-changes-openspec-termines` à partir de
      `origin/main` (dépôt propre, aucune modification étrangère embarquée).
- [x] 1.2 [T-115] Archiver les dix changes terminés avec
      `openspec archive <change> -y`, ce qui déplace chaque change vers
      `openspec/changes/archive/AAAA-MM-JJ-<change>/` et synchronise ses
      specs delta vers `openspec/specs/`.

## 2. Publication

- [x] 2.1 [T-115] Committer avec le message `docs(docs): T-115 archiver les
      changes openspec termines` (ou équivalent conforme), en ajoutant
      uniquement les fichiers de ce ticket.
- [ ] 2.2 [T-115] Pousser la branche
      `docs/chore-115-archiver-changes-openspec-termines` et ouvrir une PR
      vers `main` avec le modèle du dépôt, seulement si la livraison est
      explicitement demandée.
