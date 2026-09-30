## 1. T-161 (docs/chore-161-archiver-changes-openspec-termines-4)

Périmètre : archiver les dix changes OpenSpec dont la livraison est terminée
(tâches cochées et PR fusionnée, ou travail réel déjà constaté sur disque
pour T-116), avec la CLI `openspec archive`, en synchronisant leurs specs
delta vers `openspec/specs/`. Aucun code applicatif, aucun autre change
touché.

- [x] 1.1 [T-161] Créer/réutiliser la branche
      `docs/chore-161-archiver-changes-openspec-termines-4` à partir de
      `origin/develop`, sans modification étrangère embarquée.
- [x] 1.2 [T-161] Cocher la dernière tâche (2.2) de
      `cloturer-archivage-changes-openspec`, référençant ce ticket comme
      clôture de sa publication jamais effectuée.
- [x] 1.3 [T-161] Archiver avec `openspec archive <change> -y` les dix
      changes : `cadrer-backend-deploiement-reference`,
      `implementer-backend-deploiement-mvp`,
      `archiver-changes-openspec-termines-3`,
      `durcissement-securite-production`, `auth-rsa-portainer`,
      `activer-flux-release`, `promouvoir-images-release`,
      `cycle-vie-comptes-utilisateurs`, `aligner-backend-api-v1`,
      `cloturer-archivage-changes-openspec`. (Tous archivés sous
      `openspec/changes/archive/2026-09-30-<change>/`.)
- [x] 1.4 [T-161] Vérifier `openspec list` et l'état de `openspec/specs/`
      après archivage ; rapporter tout conflit ou fusion de capacité
      nécessitant une relecture manuelle. (Un conflit détecté et corrigé :
      la spec delta de `cycle-vie-comptes-utilisateurs` pour
      `frontend-shell` plaçait « Session et déconnexion » sous `## ADDED
      Requirements` alors que cette exigence existait déjà dans la spec
      principale (ajoutée par un change antérieur) ; reclassée sous `##
      MODIFIED Requirements` avec le contenu complet existant plus le
      nouveau scénario, avant réarchivage réussi. Les autres archivages se
      sont déroulés sans conflit ; `openspec list` ne montre plus aucun des
      dix changes, les sept changes visuels front en cours restent
      inchangés.)

## 2. Publication

- [x] 2.1 [T-161] Committer avec le message `docs(docs): T-161 archiver les
      changes openspec termines`, en ajoutant uniquement les fichiers de ce
      ticket.
- [x] 2.2 [T-161] Pousser la branche et ouvrir une PR vers `develop` avec le
      modèle du dépôt, seulement si la livraison est explicitement demandée.
      (PR #169.)
