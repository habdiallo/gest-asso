## Why

Le tableau des règlements de la fiche campagne ne reprend pas fidèlement la hiérarchie typographique du prototype cible : la police, les tailles, les graisses, les espacements et certains contrastes diffèrent entre les onglets, le titre de section, l'en-tête et les lignes. Ces écarts rendent l'interface moins cohérente avec le design de référence alors que le contenu fonctionnel du tableau est déjà en place.

Le ticket T-133 vise uniquement cette fidélité visuelle. Les colonnes, leur ordre, les données affichées, les filtres, la pagination et les actions financières restent inchangés.

## What Changes

- Aligner les libellés des onglets de détail campagne sur les tokens typographiques du prototype.
- Aligner le titre et la description de l'onglet « Règlements » sur les styles du design cible.
- Aligner l'en-tête du tableau sur la police de données, la taille, la graisse, la casse, l'interlettrage, la hauteur et les espacements attendus.
- Aligner les cellules du tableau sur les styles de texte du prototype, notamment le nom du membre, le montant en GNF, le mode de règlement et la date.
- Conserver strictement les quatre colonnes actuelles et leur ordre : membre, montant, mode de règlement, date.
- Vérifier le rendu desktop et responsive sans modifier le comportement métier, les autorisations, les appels API ou le contrat OpenAPI.

## Capabilities

### New Capabilities

- `campaign-payments-table-visual`: fidélité typographique et visuelle du tableau des règlements dans le détail d'une campagne.

### Modified Capabilities

<!-- Aucun contrat métier ou comportement fonctionnel existant n'est modifié. -->

## Impact

- Frontend : composant `CampaignPaymentsTab`, ses tests et, si nécessaire, les styles ou tokens frontend déjà existants.
- Tests : assertions de structure et de présentation observable du tableau, sans changer les scénarios métier existants.
- API et mocks : aucun changement prévu.
- OpenAPI, colonnes, filtres, pagination et enregistrement des règlements : hors périmètre.
- Livraison : ticket T-133, scope `front`, type `fix`, branche `front/fix-133-fidelite-typographie-tableau-reglements`, dépendant de T-132.
