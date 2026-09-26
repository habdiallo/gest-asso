## 1. Préparation du ticket

- [x] 1.1 [T-132] Résoudre T-132, vérifier la branche `front/fix-132-coherence-cycle-vie-campagne` et confirmer que le prérequis T-131 est disponible avant toute modification de code.
- [x] 1.2 [T-132] Relire `campaign-detail-coherence`, le design du change, `CampaignDetailPage`, `campaign-status-labels`, les mocks MSW et les tests existants afin de figer les écarts d'état, d'action et de données.

## 2. Cohérence du cycle de vie et de l'interface

- [x] 2.1 [T-132] Remplacer le libellé visible de `UPCOMING` par « Brouillon » dans la liste, le détail, les pastilles, les filtres et les tests, sans modifier la valeur API `UPCOMING`.
- [x] 2.2 [T-132] Restreindre `canCloseCampaignNow` à `CampaignStatus.Open`, retirer « Clôturer » de `UPCOMING` et vérifier la matrice des actions de configuration, d'ouverture, de règlement et de clôture pour les trois états.
- [x] 2.3 [T-132] Repositionner et hiérarchiser la checklist d'ouverture dans l'en-tête du détail, afficher les blocages et conserver une commande d'ouverture confirmée sans ajouter de transition d'annulation.

## 3. Cohérence des données mockées et des tests

- [x] 3.1 [T-132] Aligner la campagne 201 sur 62 membres, 75 000 GNF par membre et 4 650 000 GNF attendus dans les résumés de liste, de détail, les catégories et les compteurs de cotisations.
- [x] 3.2 [T-132] Ajouter ou ajuster les tests de `CampaignDetailPage`, `campaign-status-labels` et `CampaignsListPage` pour couvrir le vocabulaire « Brouillon », la matrice d'actions et l'affichage de la checklist.
- [x] 3.3 [T-132] Ajouter ou ajuster les tests MSW et les tests de situation pour vérifier les invariants de la campagne 201 et l'absence d'enregistrement de règlement avant `OPEN`.

## 4. Validation et livraison

- [x] 4.1 [T-132] Exécuter les tests frontend ciblés, la suite frontend et le build selon les commandes disponibles, puis vérifier le rendu des états `UPCOMING`, `OPEN` et `CLOSED` dans le navigateur si disponible. Le contrôle navigateur a été tenté mais reste bloqué par une interface d'extension active.
- [x] 4.2 [T-132] Exécuter `openspec validate`, `node scripts/tickets.mjs check` et `node scripts/tickets.mjs verify T-132`, puis contrôler le diff pour exclure les modifications étrangères et le contrat API non prévu.
- [ ] 4.3 [T-132] Préparer une PR ciblée vers `main` avec le ticket T-132 et le change `coherer-cycle-vie-campagne`, sans fusionner ni pousser directement vers `main`, puis traiter la revue.
