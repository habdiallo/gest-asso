## Why

L'onglet des montants par catégorie de la fiche campagne ne suit pas la hiérarchie ni le vocabulaire du prototype. Le titre, l'action d'édition, les en-têtes, les unités et l'identification visuelle des catégories rendent la lecture moins claire que dans le design cible. Le ticket T-131 corrige cet écart sans modifier les données métier ni le contrat API.

## What Changes

- Remplacer l'intitulé générique de l'onglet par la présentation « Barème de la campagne » et conserver la description associée au barème.
- Afficher l'action « Modifier les montants » dans la zone d'en-tête pour les rôles autorisés tant que la campagne n'est pas clôturée, puis laisser le backend confirmer l'enregistrement.
- Aligner le tableau sur les colonnes du prototype : `Catégorie`, `Montant de cette campagne`, `Membres concernés` et `Total attendu`.
- Présenter chaque catégorie avec une pastille de repérage et son libellé, puis afficher les montants GNF et l'unité « membres » de façon cohérente.
- Préserver les états non configuré, vide, chargement, erreur, édition et sauvegarde, ainsi que les permissions et la mise à jour du barème existantes.
- Adapter le rendu responsive et la version mobile sans créer un nouveau composant de tableau lorsque les composants partagés couvrent déjà le besoin.
- Mettre à jour les tests pour vérifier les libellés, l'ordre exact des colonnes, l'action d'édition et les états de la vue.

## Capabilities

### New Capabilities

- `campaign-category-bareme-visualization`: Décrit la présentation, les colonnes, les actions et les états observables de l'onglet du barème d'une campagne.

### Modified Capabilities

- Aucune.

## Impact

- Ticket local : T-131, scope `front`, type `fix`, branche `front/fix-131-bareme-campagne`.
- Frontend Angular : `features/campaigns/pages/campaign-detail-page` et ses tests associés.
- Composants partagés : réutilisation de `app-data-table`, `app-action-button`, des formateurs GNF et des primitives de responsive déjà présentes.
- API et données : aucun changement de contrat, d'endpoint ou de modèle généré ; les montants, catégories, effectifs et totaux restent fournis par `Campaign.categoryAmounts`.
- Livraison : une branche et une PR dédiées vers `main`, avec validations frontend et contrôles OpenSpec.
