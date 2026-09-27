## 1. Préparation du ticket

- [x] 1.1 [T-131] Vérifier le registre, résoudre T-131 et confirmer la branche `front/fix-131-bareme-campagne` avant toute modification applicative.
- [x] 1.2 [T-131] Relire les captures cible, `design/app.js`, les règles frontend, `CampaignDetailPage`, ses tests, le modèle `Campaign.categoryAmounts` et les exigences du barème avant de figer les écarts.

## 2. Alignement de l'onglet du barème

- [x] 2.1 [T-131] Aligner l'en-tête du tab catégories sur la cible avec le titre, la description, les espacements et l'action « Modifier les montants ». Visibilité corrigée par la tâche 4.2 : réservée au Brouillon (`UPCOMING`), pas « tant que la campagne n'est pas clôturée ».
- [x] 2.2 [T-131] Aligner le tableau de lecture sur les quatre colonnes métier du prototype, les clés Transloco, le formatage GNF et les unités de membres, en conservant `app-data-table`.
- [x] 2.3 [T-131] Ajouter la présentation responsive des catégories avec pastilles, libellés, états vide et non configuré, puis ouvrir l'édition dans le dialogue cible en préservant les erreurs et la soumission existantes sur `front/fix-131-bareme-campagne`.

## 3. Validation et livraison

- [x] 3.1 [T-131] Mettre à jour les tests de `CampaignDetailPage` pour couvrir l'ordre exact des colonnes, les libellés, les pastilles, les unités, les rôles, le statut de campagne, les états d'erreur et le rendu mobile observable.
- [x] 3.2 [T-131] Exécuter les validations frontend et OpenSpec, puis comparer la vue aux captures desktop et mobile dans les deux thèmes lorsque le navigateur est disponible.
- [x] 3.3 [T-131] Préparer une PR ciblée vers `main` avec le ticket T-131 et le change `aligner-bareme-campagne-design`, sans fusionner ni pousser directement vers `main`, puis traiter la revue. PR 131 fusionnée.

## 4. Corriger le cycle de vie de la campagne (retour de revue PR #131)

- [x] 4.1 [T-131] Documenter le cycle de vie à trois états d'une campagne (Brouillon/`UPCOMING`, Ouverte/`OPEN`, Clôturée/`CLOSED`) et les actions autorisées par état dans `besoins/cahier-user-stories-mvp-association-v2.md` (RG-COT-017, RG-COT-018, RG-PAY-010).
- [x] 4.2 [T-131] Corriger `canEditBaremeNow` (`campaign-detail-page.ts`) pour ne proposer l'édition du barème que sur une campagne `UPCOMING`, conformément au contrat `updateCampaignCategoryAmounts`, et restaurer/adapter le test vérifiant l'absence de l'action sur une campagne `OPEN`.
- [x] 4.3 [T-131] Restreindre l'enregistrement d'un règlement à une campagne `OPEN` dans `CampaignDuesTab` (remplacer l'entrée `campaignClosed` par une autorisation positive sur `OPEN` uniquement), aligner `createPayment` sur RG-PAY-010 avec le 409 `CAMPAIGN_NOT_OPEN`, fournir des données MSW `UPCOMING` et `CLOSED`, et couvrir ces cas dans les tests de mocks, `CampaignDuesTab` et `CampaignDetailPage`.
- [x] 4.4 [T-131] Rejouer les tests ciblés, la validation du contrat OpenAPI, le lint et la suite frontend, puis pousser la correction sur `front/fix-131-bareme-campagne` et traiter la revue avant fusion. Contrôles GitHub au vert et PR 131 fusionnée.

## 5. Ouverture explicite après préparation

- [x] 5.1 [T-131] Mettre à jour `besoins/cahier-user-stories-mvp-association-v2.md` pour remplacer l'ouverture automatique à la date par une ouverture explicite après préparation, avec les règles RG-COT-019, RG-COT-020 et l'US-COT-009.
- [x] 5.2 [T-131] Étendre `besoins/openapi.yaml` avec la checklist `CampaignOpeningReadiness`, `openedAt`, `openedBy`, `POST /campaigns/{campaignId}/open` et les conflits `CAMPAIGN_NOT_READY`, `CAMPAIGN_START_DATE_NOT_REACHED`, `CAMPAIGN_ALREADY_OPEN` et `CAMPAIGN_CLOSED`, puis régénérer le client.
- [x] 5.3 [T-131] Implémenter la commande d'ouverture côté serveur ou, si le backend n'est pas présent dans le dépôt, fournir le comportement contractuel et MSW avec une note d'intégration explicite ; recalculer la checklist et tracer l'auteur dans une opération transactionnelle.
- [x] 5.4 [T-131] Ajouter dans `CampaignDetailPage` la checklist, l'action « Ouvrir la campagne », la confirmation et le traitement des erreurs d'ouverture pour les rôles autorisés, sans modifier les règles de verrouillage déjà appliquées au barème et aux règlements.
- [x] 5.5 [T-131] Couvrir les états incomplet, prêt, date non atteinte, ouverture réussie, ouverture concurrente, campagne déjà ouverte ou clôturée, puis rejouer la validation OpenAPI, le lint, le build et la suite frontend.
