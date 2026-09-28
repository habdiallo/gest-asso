## Why

Plusieurs libellés de l'interface affichent encore des formes comme « 1 membre(s) » ou « 2 campagne(s) ». Cette notation est compréhensible mais peu professionnelle, nuit à la lecture et expose une règle de langue dans le texte visible. Le frontend dispose déjà d'un système i18n Transloco : il faut lui confier la variation singulier/pluriel pour obtenir des libellés naturels et cohérents.

## What Changes

- Remplacer les marqueurs `(s)` repérés dans les libellés de comptage par des messages pluralisables.
- Centraliser la règle de pluralisation dans les traductions françaises, avec au minimum les cas `one` et `other` et une convention explicite pour zéro.
- Conserver les paramètres numériques existants et le contenu métier des libellés.
- Étendre la configuration i18n avec le mécanisme de formatage plural compatible avec la version Transloco du frontend, sans ajouter de sélecteur de langue ni de deuxième fichier de traduction.
- Couvrir les rendus singulier, pluriel et zéro dans les tests des écrans concernés.
- Garantir qu'aucun texte visible livré par cette évolution ne contient encore un marqueur `(s)`.

## Capabilities

### New Capabilities

- `pluralisation-i18n-francaise`: rendu naturel des libellés français dépendant d'un ou plusieurs nombres dans l'interface.

### Modified Capabilities

- Aucune. La règle générale `regle-i18n-frontend` est respectée et ne change pas de contrat dans ce change.

## Impact

- Frontend Angular : `contribo-front/src/assets/i18n/fr.json`, configuration Transloco et composants/templates qui affichent les compteurs.
- Tests unitaires des features dashboard, cagnottes et membres, ainsi que tout autre écran découvert pendant l'inventaire des clés concernées.
- Dépendance frontend possible vers le plugin MessageFormat de Transloco, à valider avec les versions Angular et Transloco installées avant modification du lockfile.
- Aucun impact sur `besoins/openapi.yaml`, les API, les données métier, les autorisations ou le backend.
- Livraison prévue dans une seule PR frontend liée à T-141, branche `front/feat-141-pluriels-interface`, après la présente préparation documentaire.
