## Context

Le client API frontend est généré par OpenAPI Generator (`generatorName: typescript-angular`,
config `contribo-front/openapitools.json`, source `besoins/openapi.yaml`, sortie
`src/app/core/api/generated/`, ignorée par Git/ESLint/Prettier). L'application configure
`provideHttpClient()` sans `withFetch()` (`src/app/app.config.ts`), donc `HttpClient` s'appuie sur
le backend XHR par défaut. Aucun backend n'existe encore ; `proxy.conf.json` cible
`localhost:8080` pour `/api/**` sans réécriture. Les règles du dépôt (`api-client.md`) interdisent
d'écrire des DTO/services concurrents du généré ou de contourner le client avec des appels HTTP
manuels ; les tests unitaires doivent vérifier le client généré avec le dispositif adapté
(`HttpTestingController`), pas un mock applicatif.

## Goals / Non-Goals

**Goals:**
- Permettre de développer et tester manuellement l'IHM de chaque feature (chargement, vide, erreur,
  succès) sans backend disponible, en s'appuyant sur le client généré tel quel.
- Garder les handlers de mock alignés avec le contrat : chemins/`operationId`, modèles et enums
  générés, nullable, droits (`operatorCanRecordPayments`) et transitions décrites par
  `besoins/openapi.yaml`.
- Rendre l'activation du mock explicite et réversible, sans jamais l'embarquer dans le build de
  production ni dans un hook automatique (`start`/`build`/`test`).

**Non-Goals:**
- Remplacer `HttpTestingController` dans les tests unitaires Vitest des services générés.
- Modifier le contrat OpenAPI, le générateur ou les services/DTO générés.
- Fournir un jeu de données de mock complet pour toutes les features dès ce change : ce change pose
  le socle (dépendance, service worker, convention, doc) ; chaque ticket front consommateur ajoute
  ses propres handlers dans `features/<feature>/mocks/`.

## Decisions

- **MSW (`msw`) plutôt qu'un intercepteur `HttpInterceptorFn` maison** : MSW intercepte au niveau
  réseau (Service Worker en navigateur), donc reste totalement transparent pour `HttpClient`/XHR et
  pour le code généré — aucune modification du client ni ajout d'intercepteur applicatif à
  maintenir. Un intercepteur maison dupliquerait une logique de routage déjà fournie par MSW et
  risquerait de diverger du contrat au fil des features.
- **Handlers colocalisés par feature (`features/<feature>/mocks/handlers.ts`)**, agrégés dans un
  point d'entrée mock unique, plutôt qu'un unique fichier de handlers global : cohérent avec
  l'architecture par fonctionnalités du dépôt (`features/<feature>/`), évite un fichier fourre-tout
  et permet à chaque ticket front d'ajouter son mock sans toucher aux autres features.
- **Activation par point d'entrée de démarrage dédié** (`main.mock.ts` sélectionné via
  `fileReplacements` d'une configuration Angular `mock`, ou variable d'environnement lue dans
  `main.ts`) plutôt qu'un flag toujours actif dans `main.ts` : garantit que le mock ne peut pas se
  retrouver silencieusement dans le bundle de production, et respecte la règle « génération/activation
  explicite, sans hook automatique ».
- **Aucun changement à `HttpTestingController` pour les tests** : MSW reste un outil de développement
  interactif (navigateur), pas un dispositif de test Vitest/jsdom ; les specs de services continuent
  d'utiliser `provideHttpClientTesting`, conformément à `tests.md`/`api-client.md`.

## Risks / Trade-offs

- [Handlers de mock qui divergent du contrat au fil du temps (ex. un champ nullable oublié)] →
  Construire les réponses de mock à partir des modèles générés (`@api`) plutôt que d'objets litéraux
  libres, et revalider les handlers modifiés lors de toute évolution du contrat.
- [Risque d'activer le mock par erreur en production] → Isoler strictement l'activation dans un point
  d'entrée/bundle distinct du bundle de production par défaut ; vérifier `npm run build` (sans mode
  mock) ne référence pas les handlers.
- [Confusion entre mock de dev et mock de test] → Documenter explicitement dans
  `core/api/README.md` que MSW ne remplace jamais `HttpTestingController` dans les specs.
- [Le service worker MSW nécessite une origine servie (pas `file://`)] → Documenter que le mode mock
  s'utilise via `npm start`/serveur de dev Angular, pas en ouvrant un fichier statique directement.
- [Un handler de mock qui importe `@api` (`features/<feature>/mocks/handlers.ts`) casse la
  compilation normale quand le client généré est absent, car `tsconfig.app.json` inclut tout
  `src/**/*.ts` sans distinguer l'entrée réellement bundlée] → Exclure `src/main.mock.ts`,
  `src/mocks/**` et `**/mocks/**` de `tsconfig.app.json`, et créer `tsconfig.mock.json` (qui les
  réinclut) utilisé uniquement par la configuration Angular `mock`.
