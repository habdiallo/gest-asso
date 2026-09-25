## Why

Les écrans de détail d'une campagne et d'une cagnotte exposent déjà les données métier, mais leur hiérarchie visuelle, leurs tableaux et leurs actions ne suivent pas le prototype fourni. Les mêmes structures apparaissent dans plusieurs onglets et doivent être harmonisées maintenant pour éviter des comportements différents entre cotisations, règlements et contributions.

## What Changes

- Recomposer l'en-tête de détail avec le retour vers la liste, le contexte métier, le titre, la période, les actions principales et les indicateurs financiers.
- Créer des composants partagés pour le shell de détail, les onglets, le résumé financier, les actions et les tableaux métier.
- Aligner le détail d'une campagne sur les onglets Situation des membres, Montants par catégorie et Règlements.
- Aligner le détail d'une cagnotte sur les onglets Contributions et Informations.
- Harmoniser les recherches, filtres, statuts, pagination, états de chargement, états vides et erreurs dans les tableaux.
- Gérer les états hover, focus-visible, actif, désactivé, chargement et clic pour les lignes, onglets, boutons et contrôles de pagination.
- Préserver les règles d'autorisation existantes pour enregistrer un règlement, enregistrer une contribution, modifier un barème et clôturer une campagne ou une cagnotte.
- Vérifier la parité visuelle sur le prototype et couvrir les interactions par des tests de composants et de pages.

## Capabilities

### New Capabilities

- `reusable-detail-layouts`: Shell, résumé, onglets, actions et tableaux réutilisables pour les écrans de détail financier.
- `campaign-detail-visualization`: Présentation complète du détail d'une campagne, de ses cotisations, de son barème et de ses règlements.
- `social-fund-detail-visualization`: Présentation complète du détail d'une cagnotte, de ses contributions et de ses informations.

### Modified Capabilities

Aucune capacité existante dans `openspec/specs/` ne décrit actuellement le comportement fonctionnel de ces écrans. Les contrats de données existants seront réutilisés ; toute évolution de contrat sera documentée séparément si l'implémentation révèle un manque.

## Impact

- Ticket local : T-129, scope `front`, type `fix`, branche prévue `front/fix-129-details-campagnes-cagnottes`.
- Frontend Angular : `features/campaigns/`, `features/social-funds/` et nouveaux composants neutres dans `shared/`.
- Les services et endpoints existants pour les campagnes, cotisations, règlements, cagnottes et contributions restent la source des données.
- Les mocks MSW et les tests devront refléter les états interactifs et les pages de tableaux.
- Aucun changement backend ou migration n'est prévu à ce stade.
