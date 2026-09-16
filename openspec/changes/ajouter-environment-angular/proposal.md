## Why

`contribo-front/` ne dispose d'aucun fichier `environment.ts` : les paramètres qui varient
selon la configuration de build (URL de base de l'API, activation des mocks MSW, flags de
fonctionnalité) sont soit codés en dur, soit déduits indirectement de la configuration Angular
active (`development`, `mock`, `production`) via `fileReplacements` sur `main.ts` uniquement.
Il n'existe pas de point central typé où lire ces paramètres depuis le code applicatif. À mesure
que les tickets frontend avancent (API générée, mocks MSW posés par `mocks-msw-client-api`),
plusieurs services vont avoir besoin de connaître l'URL de base de l'API ou l'état du mode mock
sans dupliquer cette logique dans chaque feature.

## What Changes

- Ajouter les fichiers `contribo-front/src/environments/environment.ts` (développement, valeurs
  par défaut) et `environment.production.ts`, avec une interface TypeScript commune définissant
  les paramètres exposés (ex. `production: boolean`, `apiBaseUrl: string`).
- Déclarer les `fileReplacements` correspondants dans `angular.json` pour les configurations
  `production` et `development` de `contribo-front`, en s'appuyant sur le mécanisme standard
  Angular (`@angular/build:application`).
- Faire cohabiter ce socle avec la configuration `mock` existante (`tsconfig.mock.json` +
  `fileReplacements` sur `main.ts`) sans la modifier : ajouter un `environment.mock.ts` dédié et
  son `fileReplacement` pour cette configuration, afin que le mode mock reste piloté par ses
  fichiers actuels tout en bénéficiant du même point de lecture typé.
- Documenter dans `contribo-front/README.md` l'existence du dossier `src/environments/`, les
  paramètres qu'il expose et la configuration Angular associée à chaque fichier.

## Capabilities

### New Capabilities

- `environnements-angular` : socle de configuration par environnement Angular
  (`src/environments/`) exposant un contrat typé unique (URL de base de l'API, indicateur de
  production, etc.) lu par le code applicatif, avec un fichier par configuration de build
  (`development`, `mock`, `production`) raccordé via `fileReplacements` dans `angular.json`.

### Modified Capabilities

(aucune — les capacités `mocks-api-msw` et la configuration `mock` existante ne changent pas de
comportement ; ce change ajoute uniquement un point de lecture de configuration supplémentaire)

## Impact

- `contribo-front/src/environments/` : nouveaux fichiers `environment.ts`,
  `environment.mock.ts`, `environment.production.ts`.
- `contribo-front/angular.json` : ajout de `fileReplacements` pour les configurations
  `development`, `mock` et `production` de la cible `build`.
- `contribo-front/README.md` : documentation du dossier `environments/` et de son usage.
- Aucun impact sur le contrat API (`besoins/openapi.yaml`), les DTO générés, ou les tests
  Vitest existants.
- Ticket local : à attribuer (aucun ticket enregistré pour cette évolution à ce stade).
