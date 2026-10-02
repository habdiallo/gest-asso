## Why

Le tableau de bord présente actuellement des synthèses qui répètent des
informations déjà disponibles dans les quatre indicateurs principaux. Cette
duplication allonge la lecture et repousse les actions opérationnelles hors de
la zone immédiatement visible. T-135 réorganise uniquement la hiérarchie et
l'espace du tableau de bord pour rendre le parcours quotidien plus direct,
sans modifier la charte graphique, les données ni les droits existants.

## What Changes

- Supprimer les blocs « Synthèse des cotisations » et « Synthèse de la
  cagnotte » du tableau de bord de gestion.
- Conserver les quatre KPI « Membres actifs », « Cotisations encaissées »,
  « Reste sur cotisations » et « Contributions encaissées » sur une seule
  ligne en desktop.
- Placer « Actions rapides » immédiatement sous les KPI et afficher ses quatre
  actions sur une ligne, avec une largeur homogène et toute la largeur
  disponible : « Ajouter un membre », « Gérer les rôles », « Gérer les
  catégories » et « Créer une campagne ».
- Placer « Campagnes récentes » sous « Actions rapides », puis « Derniers
  règlements » sous les campagnes, chaque bloc utilisant toute la largeur du
  contenu principal.
- Conserver les couleurs, la typographie, les composants, la navigation
  latérale, les données, les filtres, les liens et les règles d'autorisation
  existants.
- Vérifier le rendu desktop à 1440 px et 1024 px, dans les deux thèmes, ainsi
  que le comportement responsive existant hors du périmètre desktop.

## Capabilities

### New Capabilities

- `dashboard-layout`: Hiérarchie et composition desktop du tableau de bord de
  gestion, avec les KPI, les actions rapides, les campagnes récentes et les
  derniers règlements.

### Modified Capabilities

- Aucun contrat API ni comportement métier n'est modifié. Les exigences
  d'affichage des données existantes restent inchangées.

## Impact

- Frontend uniquement : `contribo-front/src/app/features/dashboard/` et les
  tests colocalisés du tableau de bord.
- Le changement dépend de T-126 pour conserver les composants d'action et les
  cartes KPI harmonisés, ainsi que de T-127 pour préserver le comportement du
  panneau « Derniers règlements ».
- Aucun changement de `contribo-back/src/main/resources/contribo-api.yml`, de migration ou de données
  persistées.
- Livraison prévue sur `front/fix-135-refonte-agencement-tableau-de-bord`, dans
  une PR dédiée vers `main`.
