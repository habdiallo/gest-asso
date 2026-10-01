## Why

Le frontend Contribo possède déjà des couleurs, des familles de polices et quelques
tokens Tailwind CSS 4, mais les pages et composants répètent encore de nombreuses
valeurs locales pour la typographie, les arrondis, les espacements, les dimensions
et le responsive. Cette dispersion rend la hiérarchie visuelle moins prévisible et
augmente le risque de régressions entre les écrans, notamment entre les breakpoints
et dans les tableaux, formulaires, dialogues et sidebars.

Le ticket T-138 établit d'abord un audit mesurable, puis applique uniquement les
conventions qui représentent réellement des patterns récurrents du produit. Il
vise une harmonisation sans redesign, sans modification du parcours métier et sans
remplacer chaque exception locale par un token global.

## What Changes

- Produire une synthèse d'audit couvrant les niveaux typographiques réellement utilisés,
  les textes courants et secondaires, les labels, les tableaux, les KPI, les valeurs
  numériques, les actions, les rayons, les espacements, les dimensions, les conteneurs,
  les grilles, les media queries et les règles CSS dupliquées.
- Mesurer les fréquences et les contextes des valeurs répétées, notamment les tailles
  arbitraires Tailwind, afin de distinguer les conventions du produit des besoins
  ponctuels ou des héritages historiques.
- Définir une échelle typographique cohérente et préciser les niveaux qui restent
  stables de ceux qui nécessitent une adaptation responsive fondée sur la lisibilité,
  la hiérarchie et la densité réelles des écrans.
- Définir une logique répétable pour les arrondis des contrôles, cartes, panneaux,
  dialogues, pastilles et éléments circulaires, en conservant les exceptions justifiées.
- Définir des primitives raisonnables pour le padding, le margin, le gap, les hauteurs,
  les largeurs, les conteneurs et les espacements de section et de composant.
- Faire évoluer le thème CSS-first de Tailwind CSS 4 uniquement pour les conventions
  globales démontrées par l'audit, notamment les tokens de typographie, de rayon,
  d'espacement ou de dimensions lorsqu'ils simplifient réellement les utilities.
- Appliquer les conventions retenues aux composants partagés et aux pages concernées,
  en conservant les couleurs, l'identité visuelle, les fonctionnalités, les droits,
  les données, les routes et la hiérarchie fonctionnelle des écrans.
- Intégrer T-137 comme état de référence déjà fusionné : sidebar contextuelle,
  page `Mon accès`, badges de statut partagés et ajustements des filtres et selects
  doivent être inclus dans l'audit, sans réimplémenter leur périmètre fonctionnel.
- Harmoniser la stratégie responsive, les conteneurs et les grilles sans multiplier
  les breakpoints ; évaluer les container queries seulement lorsque la largeur du
  composant, plutôt que celle de la fenêtre, justifie cette approche.
- Utiliser la capture mobile fournie comme référence d'agencement et de densité :
  en-tête compact, titre et action pleine largeur, cartes en deux colonnes lorsque
  la largeur le permet, sections empilées, listes dans des surfaces lisibles et
  navigation basse. Cette référence sert à analyser les comportements, pas à
  ajouter les contenus ou parcours visibles dans la maquette.
- Vérifier les écrans et composants principaux sur des largeurs de viewport exactes
  et intermédiaires, avec une attention particulière aux débordements, textes longs,
  tableaux, formulaires, modales, navigation, sidebars, cartes, grilles, états vides
  et actions principales.
- Ne modifier aucune API, donnée persistée, dépendance applicative ou règle métier.

## Capabilities

### New Capabilities

- `frontend-visual-conventions`: conventions observables de typographie, arrondis,
  espacements, dimensions et tokens Tailwind CSS 4 du frontend Contribo.
- `frontend-responsive-layout`: stratégie observable de responsive, conteneurs,
  grilles, breakpoints, transitions intermédiaires et comportement des composants
  réutilisés selon l'espace disponible.

### Modified Capabilities

- `composants-interaction-visual`: les exigences des boutons, champs, tableaux et
  composants partagés doivent consommer les conventions globales retenues par l'audit
  au lieu de maintenir des valeurs concurrentes, tout en conservant leurs contrats
  d'accessibilité et de comportement.
- `frontend-shell`: l'exigence d'adaptation responsive doit préciser les transitions
  réellement nécessaires pour le shell, les dialogues et la navigation, y compris
  les largeurs intermédiaires, sans imposer une variation de toutes les tailles.

## Impact

- Ticket local : T-138, scope `front`, type `refactor`, branche
  `front/refactor-138-harmoniser-systeme-visuel`, dépendant de T-137.
- Frontend Angular : `contribo-front/src/styles.css`, `src/app/app.css`, composants
  de `shared/` et pages des features qui portent les conventions répétées.
- Tests frontend : ajustement des tests de présentation uniquement lorsque les
  marqueurs vérifiés correspondent à une convention retenue ou à un comportement
  responsive observable.
- Aucun impact backend, OpenAPI, migration, session, autorisation ou dépendance npm.
- La capture mobile et les maquettes du dashboard restent des références visuelles ;
  elles ne déclenchent aucun ajout de KPI, de section, de donnée ou d'action absent
  du produit actuel.
- Livraison prévue en une PR frontend vers `main`, après l'audit et les validations
  de build, tests, lint, format et vérifications visuelles disponibles.
