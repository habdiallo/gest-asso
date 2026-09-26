## 1. Préparation du ticket

- [x] 1.1 [T-131] Vérifier le registre, résoudre T-131 et confirmer la branche `front/fix-131-bareme-campagne` avant toute modification applicative.
- [x] 1.2 [T-131] Relire les captures cible, `design/app.js`, les règles frontend, `CampaignDetailPage`, ses tests, le modèle `Campaign.categoryAmounts` et les exigences du barème avant de figer les écarts.

## 2. Alignement de l'onglet du barème

- [x] 2.1 [T-131] Aligner l'en-tête du tab catégories sur la cible avec le titre, la description, les espacements et l'action « Modifier les montants », visible pour les rôles autorisés tant que la campagne n'est pas clôturée.
- [x] 2.2 [T-131] Aligner le tableau de lecture sur les quatre colonnes métier du prototype, les clés Transloco, le formatage GNF et les unités de membres, en conservant `app-data-table`.
- [x] 2.3 [T-131] Ajouter la présentation responsive des catégories avec pastilles, libellés, états vide et non configuré, puis ouvrir l'édition dans le dialogue cible en préservant les erreurs et la soumission existantes sur `front/fix-131-bareme-campagne`.

## 3. Validation et livraison

- [x] 3.1 [T-131] Mettre à jour les tests de `CampaignDetailPage` pour couvrir l'ordre exact des colonnes, les libellés, les pastilles, les unités, les rôles, le statut de campagne, les états d'erreur et le rendu mobile observable.
- [x] 3.2 [T-131] Exécuter les validations frontend et OpenSpec, puis comparer la vue aux captures desktop et mobile dans les deux thèmes lorsque le navigateur est disponible.
- [ ] 3.3 [T-131] Préparer une PR ciblée vers `main` avec le ticket T-131 et le change `aligner-bareme-campagne-design`, sans fusionner ni pousser directement vers `main`, puis traiter la revue.
