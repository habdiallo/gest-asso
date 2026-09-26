## Why

La fiche de campagne mélange actuellement les actions de plusieurs états du cycle de vie. Une campagne `UPCOMING` affichée comme « À venir » peut notamment présenter une action de clôture, alors que la clôture ne devient pertinente qu'après l'ouverture. Les données de démonstration renforcent la confusion : la liste annonce 62 membres tandis que le détail et les totaux financiers utilisent 91.

Le ticket T-131 a établi le contrat d'ouverture explicite, la checklist de préparation et le verrouillage du barème. Le ticket T-132 rend ce parcours lisible et cohérent dans l'interface et les mocks, après la livraison de T-131.

## What Changes

- Présenter `UPCOMING` comme un état de brouillon ou de préparation, avec un libellé cohérent entre la liste et le détail.
- Afficher les actions selon une matrice stricte : configuration et ouverture en brouillon, règlements et clôture à l'état ouvert, consultation seule à l'état clôturé.
- Retirer l'action « Clôturer » d'une campagne `UPCOMING` ; une éventuelle annulation de brouillon reste hors périmètre et ne sera pas assimilée à une clôture.
- Rendre la checklist d'ouverture visible au même niveau que l'action d'ouverture, avec les raisons de blocage lorsqu'une condition manque.
- Hiérarchiser les actions pour qu'une seule commande de cycle de vie soit primaire selon l'état courant.
- Aligner les mocks de la campagne de démonstration « Rentrée associative » sur la valeur canonique de 62 membres, y compris les catégories, les cotisations et les totaux attendus.
- Ajouter ou ajuster les tests de page, de statut et de mocks afin de détecter toute incohérence entre résumé, détail et situation financière.
- Ne pas modifier le contrat API déjà documenté par T-131 ; aucun nouveau statut persistant ni endpoint d'annulation n'est introduit.

## Capabilities

### New Capabilities

- `campaign-detail-coherence`: Décrit la présentation cohérente des états, actions, checklist d'ouverture et données financières de la fiche campagne.

### Modified Capabilities

- Aucune. Le contrat de cycle de vie et l'ouverture explicite restent ceux livrés par T-131 ; ce change précise leur représentation frontend et leurs données de démonstration.

## Impact

- Ticket local : T-132, scope `front`, type `fix`, branche `front/fix-132-coherence-cycle-vie-campagne`.
- Prérequis : T-131 et le change `aligner-bareme-campagne-design`, notamment leur contrat OpenAPI et leur modèle `CampaignOpeningReadiness`.
- Frontend Angular : `features/campaigns/pages/campaign-detail-page`, `campaign-status-labels`, la page de liste si le libellé est partagé, et les tests associés.
- Données de démonstration : `features/campaigns/mocks/handlers.ts` et les scénarios MSW associés.
- Contrat API : aucun changement prévu. `POST /campaigns/{campaignId}/open`, les statuts `UPCOMING`/`OPEN`/`CLOSED` et les règles `RG-COT-017` à `RG-COT-020` restent la référence.
- Livraison : une PR frontend dédiée vers `main` après résolution du prérequis T-131. Aucun code applicatif, commit ou publication n'est inclus dans cette proposition.
