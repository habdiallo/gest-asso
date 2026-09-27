## Why

Le codebase frontend a grandi par ajouts successifs et peut contenir des duplications, des responsabilités mélangées, des incohérences de typage et du code mort difficile à distinguer sans audit transversal. Une refactorisation ciblée est proposée maintenant pour réduire la complexité interne tout en conservant strictement le comportement, le rendu, les parcours et les contrats existants.

## What Changes

- Cartographier l'architecture, les flux, les dépendances, les conventions et les zones à risque du frontend.
- Auditer systématiquement les duplications, responsabilités, types, appels API, états, styles, dépendances et éléments potentiellement morts.
- Produire une synthèse priorisée reliant chaque problème démontré à une correction, un bénéfice, un risque et une validation.
- Réaliser uniquement les refactorisations dont le bénéfice est démontré, par groupes cohérents et réversibles.
- Consolider les patterns existants lorsque cela réduit réellement la duplication, sans introduire d'architecture parallèle ni de sur-abstraction.
- Supprimer uniquement le code mort dont l'absence d'utilisation est démontrée, après vérification des routes, imports, configurations, scripts et tests.
- Ajouter ou ajuster les tests nécessaires pour prouver la conservation du comportement observable.
- Documenter les limites et les opportunités volontairement reportées lorsqu'elles impliqueraient une évolution fonctionnelle, visuelle, contractuelle ou architecturale majeure.
- Ne pas inclure les cinq skills `source-command-opsx-*` déplacés précédemment : ils ne correspondent pas aux sources canoniques attendues par `main` et la parité IA est déjà valide sans eux.

## Capabilities

### New Capabilities

- `refactorisation-sans-regression`: encadrer l'audit et la refactorisation interne avec des invariants de comportement, de rendu, de contrats et de validation.

### Modified Capabilities

- Aucune exigence fonctionnelle existante n'est modifiée.

## Impact

- Frontend Angular/TypeScript sous `contribo-front/`, incluant les features, `core/`, `shared/`, tests, styles, scripts et configuration de validation.
- Documentation OpenSpec et registre local des tickets, avec T-140 sur la branche `front/refactor-140-audit-refactorisation-sans-regression`.
- Aucun changement prévu du contrat `besoins/openapi.yaml`, des routes, des permissions, des données stockées, des dépendances externes ou du rendu visuel, sauf justification explicite issue de l'audit et validation dédiée.
- La livraison sera découpée en commits cohérents et une seule PR T-140 vers `main`.
