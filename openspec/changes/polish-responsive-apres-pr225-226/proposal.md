## Why

Après les PR 225 et 226, le shell responsive dispose déjà des garde-fous de navigation et de session, mais ses marges, zones de défilement et actions compactes restent sensibles aux largeurs très étroites et intermédiaires. Ce ticket vise un polish CSS ciblé, réversible et sans modification d'API, vérifié à 320, 375, 820 et desktop afin de réduire les risques de régression visuelle.

## What Changes

- Stabiliser les espacements du shell mobile avec les safe areas et une largeur de lecture maîtrisée.
- Rendre la navigation basse et les actions de l'en-tête adaptatives sans débordement horizontal de la page.
- Préserver les libellés accessibles, les routes, les droits et la hiérarchie des actions existantes.
- Ajouter des tests frontend et une campagne de vérification visuelle aux quatre largeurs de référence.
- Ne modifier ni endpoint, ni contrat API, ni stockage de session.

## Capabilities

### New Capabilities

- `responsive-layout-validation`: critères observables de composition et de validation du shell responsive après les PR 225 et 226.

### Modified Capabilities

## Impact

- Frontend Angular, principalement `app.css`, `app.html` et `shared/navigation-menu/`.
- Tests unitaires ou de composition du shell responsive.
- Aucun impact backend, API, migration, dépendance ou permission.
- Livraison sur `front/refactor-205-polish-responsive-apres-pr225-226` par une PR vers `develop`, avec retour arrière possible par revert de la PR.
