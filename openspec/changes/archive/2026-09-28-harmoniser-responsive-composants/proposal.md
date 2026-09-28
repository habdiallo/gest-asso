## Why

Les fondations visuelles desktop et les tokens globaux ont été harmonisés dans
T-138, mais l'expérience mobile peut encore varier fortement entre le shell, les
composants partagés et les écrans des différentes features. Une correction limitée
au dashboard risquerait de créer des règles locales et de reproduire les mêmes
problèmes sur les autres composants.

T-139 vise donc une adaptation responsive cohérente de tout le système de composants
frontend, avec les captures du dashboard comme références de densité et de
composition, sans les traiter comme une spécification fonctionnelle.

## What Changes

- Auditer les écrans et composants existants sur plusieurs largeurs mobiles,
  intermédiaires, tablettes et desktops.
- Définir des règles responsive observables pour le shell, les composants `shared/`,
  les composants locaux des features et les pages métier.
- Recomposer lorsque nécessaire les cartes, KPI, listes, formulaires, tableaux,
  filtres, actions rapides, dialogues et navigations afin de préserver la lisibilité
  et une densité adaptée à chaque largeur.
- Utiliser la progressive disclosure uniquement pour les informations secondaires,
  sans supprimer de donnée essentielle ni modifier les droits ou parcours métier.
- Préserver les tokens et primitives établis par T-138, les deux thèmes, les zones
  de touch accessibles, le focus clavier et les défilements locaux nécessaires.
- Vérifier les largeurs exactes et intermédiaires, les contenus longs, les valeurs
  financières, les états vides et les transitions entre breakpoints.
- Ne modifier ni l'API, ni les données persistées, ni les routes, ni les dépendances
  npm, ni le contenu fonctionnel illustré uniquement par les captures.

## Capabilities

### New Capabilities

- `frontend-responsive-composition`: règles observables de composition responsive
  pour tous les composants visuels du frontend.
- `frontend-mobile-audit`: méthode d'audit et de validation visuelle mobile,
  intermédiaire et desktop avant et après les adaptations.

### Modified Capabilities

Aucune capacité existante n'est modifiée dans ce change. Les nouvelles exigences
décrivent le comportement transversal attendu sans remplacer les contrats métier
des features existantes.

## Impact

- Ticket local : T-139, scope `front`, type `refactor`, branche
  `front/refactor-139-harmoniser-responsive-composants`.
- Frontend Angular : shell applicatif, `shared/`, composants et pages de
  `features/`, styles globaux et tests de présentation concernés.
- Aucun impact backend, OpenAPI, migration, session, autorisation ou dépendance.
- Livraison prévue par une PR frontend vers `main`, avec vérifications ciblées,
  suite frontend, lint, format, build et contrôle visuel documenté.
