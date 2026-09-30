## 1. Contrat

- [x] 1.1 [T-166] Renommer les 3 tags accentués dans `besoins/openapi.yaml` : `Catégories de revenu` → `Categories de revenu`, `Règlements` → `Reglements`, `Utilisateurs et rôles` → `Utilisateurs et roles`, sans toucher aux chemins, `operationId`, schémas ni règles d'autorisation.
- [x] 1.2 [T-166] Documenter l'exigence « tags ASCII » dans les conventions de contrat pertinentes (référencer `openspec/specs/api-design-first-governance/spec.md`).

## 2. Régénération backend

- [x] 2.1 [T-166] Régénérer les interfaces Spring (`mvn generate-sources` ou équivalent) et confirmer que `CategoriesDeRevenuApi`, `ReglementsApi`, `UtilisateursEtRolesApi` remplacent les anciens noms tronqués.
- [x] 2.2 [T-166] Mettre à jour `IncomeCategoryController`, `PaymentController`, `UserAccountController` pour implémenter les nouvelles interfaces renommées.
- [x] 2.3 [T-166] Compiler le backend (`mvn compile`) pour confirmer l'absence de référence résiduelle aux anciens noms.

## 3. Régénération frontend

- [x] 3.1 [T-166] Régénérer le client Angular (`npm run generate:api`) et confirmer que `catgories-de-revenu`, `rglements`, `utilisateurs-et-rles` sont remplacés par leurs équivalents ASCII dans `src/app/core/api/generated/`.
- [x] 3.2 [T-166] Rechercher-remplacer les 23 fichiers applicatifs identifiés référençant `CatgoriesDeRevenuService`/`RglementsService`/`UtilisateursEtRlesService` (features `income-categories`, `roles-users`, `campaigns`, `members`, `app.spec.ts`) vers les nouveaux noms de classes.
- [x] 3.3 [T-166] Compiler et lancer le lint frontend (`ng build`, `npm run lint`) pour confirmer l'absence de référence résiduelle.

## 4. Validation

- [x] 4.1 [T-166] Exécuter la suite de tests frontend affectée (`npm test`, périmètre income-categories/roles-users/campaigns/members) et la suite backend affectée (contrôleurs renommés).
- [x] 4.2 [T-166] Vérifier qu'aucune autre occurrence des anciens noms tronqués ne subsiste dans `contribo-front/src` et `contribo-back/src` (recherche globale).
- [x] 4.3 [T-166] Préparer la PR vers `develop` référençant ce ticket et ce change OpenSpec (`corriger-encodage-noms-fichiers-generes`), sans fusion ni auto-merge sans demande explicite.
