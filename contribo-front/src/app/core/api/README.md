# Client API

Source unique : `besoins/openapi.yaml` à la racine. Depuis `contribo-front/`, lancer
`npm run validate:api` puis `npm run generate:api`. Java 11+ est nécessaire ; le
premier lancement télécharge le JAR fixé dans `openapitools.json`.

La sortie `generated/` est ignorée par Git, ESLint et Prettier. Ne jamais la modifier
manuellement : modifier la configuration/contrat puis régénérer. Importer les types
et services via `@api` après génération. Aucun package npm client séparé n'est créé.

Le client utilise `/api/v1`, configuré par le contrat. `provideHttpClient()` est
installé au niveau applicatif. Configurer les credentials Bearer depuis la session
réelle lors de l'intégration de l'authentification ; ne pas coder un jeton ni une
URL de développement dans un service de feature.

La génération est explicite, sans hook npm automatique. Avant de construire/tester
une feature qui importe `@api`, générer le client. Le shell d'accueil n'en dépend
pas. Vérifier la compilation avec `npx --no-install tsc --noEmit -p tsconfig.app.json`.

## Mock réseau en développement (MSW)

Tant que le backend n'est pas disponible, `npm run start:mock` démarre l'application avec
[MSW](https://mswjs.io) : un service worker (`public/mockServiceWorker.js`, généré par
`npx msw init public --save`) intercepte les requêtes de `HttpClient` au niveau réseau, sans
modifier le client généré ni les services. C'est un dispositif de développement/navigateur
uniquement — `npm start` et `npm run build` restent inchangés et ne le chargent jamais.

Chaque feature qui consomme `@api` en mode mock ajoute ses handlers dans
`features/<feature>/mocks/handlers.ts`, construits à partir des chemins/`operationId` et des
modèles générés (pas de DTO concurrent du contrat), puis les agrège dans
`src/mocks/handlers.ts`. Voir `features/home/mocks/handlers.ts` pour un exemple sur
`GET /api/v1/dashboard`.

MSW ne remplace jamais `HttpTestingController` : les tests Vitest des services générés
continuent de vérifier requêtes/réponses/erreurs avec `provideHttpClientTesting`, sans
dépendre du service worker.

`public/mockServiceWorker.js` est copié dans tous les builds (assets `public/**/*`), y compris
`npm run build` en production : c'est le comportement standard de `msw init`. Ce fichier reste
inerte tant qu'il n'est pas explicitement enregistré, ce qui n'arrive que via `main.mock.ts`,
absent du bundle de production.
