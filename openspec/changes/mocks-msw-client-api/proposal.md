## Why

Le backend n'est pas encore implémenté. Le client API frontend est généré depuis
`besoins/openapi.yaml` (`typescript-angular`, sortie `contribo-front/src/app/core/api/generated/`)
et utilise `provideHttpClient()` (XHR classique, sans `withFetch`). Sans dispositif de mock, les
équipes front sont bloquées pour développer/tester l'IHM des tickets déjà planifiés
(ex. T-3, T-21, T-27, T-33...) ou contournent le problème avec des données codées en dur dans les
composants, ce qui introduit de la dette et des DTO concurrents du contrat.

## What Changes

- Ajouter `msw` en devDependency de `contribo-front/` et initialiser son service worker
  (`npx msw init public --save`).
- Définir une convention de handlers MSW par feature (`src/app/features/<feature>/mocks/handlers.ts`),
  construits uniquement à partir des chemins/`operationId`/modèles issus du client généré (`@api`),
  sans DTO ni service concurrents du contrat.
- Fournir un point d'entrée de démarrage dédié au mode mocké (ex. `main.mock.ts` + `fileReplacements`
  Angular, ou variable d'environnement lue dans `main.ts`), activé explicitement (`npm run start:mock`
  ou équivalent), jamais par un hook automatique de build/démarrage/test.
- Documenter dans `contribo-front/src/app/core/api/README.md` (ou un document dédié) que MSW sert
  uniquement le mode dev/navigateur, et que les tests unitaires Vitest continuent d'utiliser
  `HttpTestingController`/`provideHttpClientTesting`, jamais MSW.

## Capabilities

### New Capabilities

- `mocks-api-msw` : dispositif de mock réseau (MSW) du client API généré, activable en développement
  pour tester l'IHM sans backend, avec des handlers respectant modèles, enums, nullable, droits et
  transitions du contrat OpenAPI.

### Modified Capabilities

(aucune — cette évolution ajoute un outillage de développement, sans changer le contrat ni le
comportement des services générés)

## Impact

- `contribo-front/package.json` et `package-lock.json` : nouvelle devDependency `msw` et script(s) npm.
- `contribo-front/public/` : fichier de service worker généré par `msw init`.
- `contribo-front/src/app/` : point d'entrée de démarrage mocké, et dossiers `features/<feature>/mocks/`
  créés au fil des tickets front qui en ont besoin (pas dans ce change, qui pose seulement le socle).
- `contribo-front/src/app/core/api/README.md` : mention de la politique mock dev vs tests.
- Aucun impact sur `besoins/openapi.yaml`, le générateur, ni les services/DTO générés.
- Ticket local : T-105 (`front/chore-105-mocks-msw-client-api`, `front/chore-000-mocks-msw-client-api`
  pendant l'initialisation), sans dépendance bloquante sur un autre ticket du registre.
