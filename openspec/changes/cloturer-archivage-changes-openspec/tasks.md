## 1. T-116 (docs/chore-116-cloturer-archivage-changes-openspec)

Périmètre : clôturer le lot d'archivage OpenSpec en cours. Cocher la
dernière tâche des trois changes déjà fusionnés (comptes-demo-connexion-session,
corriger-libelle-deconnexion-200, finaliser-initialisation-000), puis
archiver ces trois changes ainsi que le change d'archivage précédent
(archiver-changes-openspec-termines, T-115, terminé). Aucun code applicatif,
aucun autre change touché.

- [x] 1.1 [T-116] Créer/réutiliser la branche
      `docs/chore-116-cloturer-archivage-changes-openspec` à partir de
      `origin/main` (dépôt propre, aucune modification étrangère embarquée).
- [x] 1.2 [T-116] Cocher la dernière tâche de comptes-demo-connexion-session
      (4.3 [T-107]), corriger-libelle-deconnexion-200 (4.3 [T-110]) et
      finaliser-initialisation-000 (5.3 [T-106]), en référençant la PR
      fusionnée correspondante.
- [x] 1.3 [T-116] Archiver avec `openspec archive <change> -y` :
      comptes-demo-connexion-session, corriger-libelle-deconnexion-200,
      finaliser-initialisation-000, archiver-changes-openspec-termines.

## 2. Publication

- [x] 2.1 [T-116] Committer avec le message `docs(docs): T-116 cloturer le
      lot d'archivage openspec` (ou équivalent conforme), en ajoutant
      uniquement les fichiers de ce ticket.
- [ ] 2.2 [T-116] Pousser la branche
      `docs/chore-116-cloturer-archivage-changes-openspec` et ouvrir une PR
      vers `main` avec le modèle du dépôt, seulement si la livraison est
      explicitement demandée.
